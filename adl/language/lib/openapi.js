import { getDescription } from './decorators.js';
import {
  basePathForResource,
  getHeaderFieldName,
  getPathParamName,
  getQueryParamName,
  getResources,
} from './rest.js';

let init = false;

const root = {
  swagger: '2.0',
  info: {},
  schemes: ['https'],
  paths: {},
  definitions: {},
  parameters: {},
};
let program;

export function onBuild(p, entity) {
  program = p;
  emitOpenAPI();
}

export function operationId() {}

function emitOpenAPI(program) {
  for (let resource of getResources()) {
    emitPathsFromResource(resource);
  }

  console.log(JSON.stringify(root, null, 4));
}

function emitPathsFromResource(resource) {
  let basePath = basePathForResource(resource);
  basePath = basePath || '/';

  if (!root.paths[basePath]) {
    root.paths[basePath] = {};
  }

  const pathParams =
    basePath.match(/\{\w+\}/g)?.map((s) => s.slice(1, -1)) ?? [];

  if (resource.properties.has('list')) {
    const prop = resource.properties.get('list');
    const { endpointShape } = endpointShapeFromSignature(resource, prop);
    root.paths[basePath].get = endpointShape;
  }

  if (resource.properties.has('create')) {
    const prop = resource.properties.get('create');
    const { endpointShape } = endpointShapeFromSignature(resource, prop);
    root.paths[basePath].post = endpointShape;
  }

  if (resource.properties.has('read')) {
    const prop = resource.properties.get('read');
    const { endpointShape, pathParams } = endpointShapeFromSignature(
      resource,
      prop
    );
    const subPath = assembleSubpath(basePath, pathParams);
    if (!root.paths[subPath]) {
      root.paths[subPath] = {};
    }
    root.paths[subPath].get = endpointShape;
  }

  if (resource.properties.has('update')) {
    const prop = resource.properties.get('update');
    const { endpointShape, pathParams } = endpointShapeFromSignature(
      resource,
      prop
    );
    const subPath = assembleSubpath(basePath, pathParams);
    if (!root.paths[subPath]) {
      root.paths[subPath] = {};
    }
    root.paths[subPath].update = endpointShape;
  }

  if (resource.properties.has('delete')) {
    const prop = resource.properties.get('delete');
    const { endpointShape, pathParams } = endpointShapeFromSignature(
      resource,
      prop
    );
    const subPath = assembleSubpath(basePath, pathParams);
    if (!root.paths[subPath]) {
      root.paths[subPath] = {};
    }
    root.paths[subPath].delete = endpointShape;
  }

  if (resource.properties.has('deleteAll')) {
    const prop = resource.properties.get('deleteAll');
    const { endpointShape } = endpointShapeFromSignature(resource, prop);
    root.paths[basePath].delete = endpointShape;
  }

  // the first parameters is the resource id
}

function assembleSubpath(basePath, pathParams) {
  const firstPath = pathParams[0];
  return `${basePath}${basePath.endsWith('/') ? '' : '/'}{${firstPath.name}}`;
}

/**
 *
 * @param {*} resource
 * @param {*} prop
 */
function endpointShapeFromSignature(resource, prop) {
  let parameters = [];
  let pathParams = [];
  if (resource.parameters) {
    const { shapes, fields } = parameterShapesFromParameters(
      resource.parameters
    );
    parameters = parameters.concat(shapes);
    pathParams = [...pathParams, ...fields.pathParams.values()];
  }

  if (prop.parameters) {
    const { shapes, fields } = parameterShapesFromParameters(prop.parameters);
    parameters = parameters.concat(shapes);
    pathParams = [...pathParams, ...fields.pathParams.values()];
  }

  return {
    pathParams,
    endpointShape: {
      summary: getDescription(prop),
      parameters,
      responses: responseShapesFromReturnType(prop.returnType),
    },
  };
}

const knownParameters = new Map();
function parameterShapesFromParameters(params) {
  const shapes = [];
  const fields = {
    statusCode: undefined,
    headers: new Map(),
    queries: new Map(),
    pathParams: new Map(),
    schema: {},
  };

  getSchemaForType(params, fields);

  // in the future, let's be more careful about clobbering prameters
  // (but odds are these are just the same params declared multiple times)

  // TODO: refactor below, much is repeated.
  for (const [name, value] of fields.headers) {
    const description = getDescription(value);

    // cache by node to disambiguate different type instantiations
    const known = knownParameters.get(value.node);
    if (known) {
      shapes.push(known);
      continue;
    }

    const paramSchema = getSchemaForType(value.type);
    paramSchema.name = value.name;
    paramSchema.in = 'header';
    paramSchema.description = description;

    root.parameters[value.name] = paramSchema;

    const schema = {
      $ref: '#/parameters/' + value.name,
    };
    knownParameters.set(value.node, schema);
    shapes.push(schema);
  }

  for (const [name, value] of fields.queries) {
    const description = getDescription(value);
    const known = knownParameters.get(value.node);
    if (known) {
      shapes.push(known);
      continue;
    }

    const paramSchema = getSchemaForType(value.type);
    paramSchema.name = value.name;
    paramSchema.in = 'query';
    paramSchema.description = description;
    root.parameters[value.name] = paramSchema;

    const schema = {
      $ref: '#/parameters/' + value.name,
    };

    knownParameters.set(value.node, schema);
    shapes.push(schema);
  }

  for (const [name, value] of fields.pathParams) {
    const description = getDescription(value);
    const known = knownParameters.get(value.node);
    if (known) {
      shapes.push(known);
      continue;
    }

    const paramSchema = getSchemaForType(value.type);
    paramSchema.name = value.name;
    paramSchema.in = 'path';
    paramSchema.description = description;

    root.parameters[value.name] = paramSchema;

    const schema = {
      $ref: '#/parameters/' + value.name,
    };

    knownParameters.set(value.node, schema);
    shapes.push(schema);
  }

  return {
    shapes,
    fields,
  };
}

function responseShapesFromReturnType(returnType) {
  const responseShapes = {};

  let successType, errorType;
  // TODO: Support discriminating based on statusCode header.
  if (returnType.kind === 'Union') {
    successType = returnType.options[0];
    errorType = returnType.options[1];
  } else {
    successType = returnType;
  }

  responseShapeFromType(responseShapes, successType, 200);
  if (errorType) {
    responseShapeFromType(responseShapes, errorType, 'default');
  }

  return responseShapes;
}

function responseShapeFromType(responseShapes, type, defaultStatusCode) {
  if (
    type.kind === 'Model' &&
    type.assignmentType === undefined &&
    type.properties.size === 0
  ) {
    responseShapes[defaultStatusCode === 200 ? 201 : defaultStatusCode] = {
      description: 'Null response',
    };

    return;
  }

  let statusCode = defaultStatusCode;
  const { headers, schema } = unpackResponseType(type);
  const response = {
    headers: {},
    content: {
      'application/json': {
        schema: schema,
      },
    },
  };

  for (let [name, value] of headers) {
    // special case - could probably have separate decorator for status code?
    if (name === 'statusCode') {
      statusCode = getSchemaForType(value.type);
      continue;
    }
    name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    response.headers[name] = getSchemaForType(value.type);
  }

  responseShapes[statusCode] = response;
}

function unpackResponseType(type) {
  const fields = {
    statusCode: undefined,
    headers: new Map(),
    queries: new Map(),
    pathParams: new Map(),
    schema: {},
  };

  if (type.kind === 'Model' && type.assignmentType) {
    type = type.assignmentType;
  }

  fields.schema = getSchemaForType(type, fields);

  return fields;
}

const knownModels = new Map();
function getSchemaForType(type, fields) {
  if (knownModels.has(type)) {
    return knownModels.get(type);
  }

  const builtinType = mapADLTypeToOpenAPI(type);
  if (builtinType) return builtinType;

  if (type.kind === 'Array') {
    return getSchemaForArray(type, fields);
  } else if (type.kind === 'Model') {
    return getSchemaForModel(type, fields);
  } else if (type.kind === 'Union') {
    return getSchemaForUnion(type, fields);
  }

  throw new Error("Couldn't get schema for type " + type.kind);
}

function getSchemaForUnion(union, fields) {
  return {
    oneOf: union.options.map((o) => getSchemaForType(o, fields)),
  };
}

const knownModelArrays = new Map();
function getSchemaForArray(array, fields) {
  const target = array.elementType;

  if (knownModelArrays.has(target)) {
    return knownModelArrays.get(target);
  }

  const schemaName = target.name + 'Array';
  root.definitions[schemaName] = {
    type: 'Array',
    items: getSchemaForType(target, fields),
  };

  const schema = {
    $ref: '#/definitions/' + schemaName,
  };

  knownModelArrays.set(target, schema);

  return schema;
}

function getSchemaForModel(model, fields) {
  const modelSchema = {
    type: 'object',
    required: [],
    properties: {},
  };

  for (const [name, prop] of model.properties) {
    const templateField = getTemplateField(model, name);
    const headerInfo = getHeaderFieldName(templateField);
    const queryInfo = getQueryParamName(templateField);
    const pathInfo = getPathParamName(templateField);
    if (headerInfo) {
      fields.headers.set(headerInfo, prop);
    } else if (queryInfo) {
      fields.queries.set(queryInfo, prop);
    } else if (pathInfo !== undefined) {
      fields.pathParams.set(pathInfo, prop);
    } else {
      if (!prop.optional) {
        modelSchema.required.push(name);
      }
      modelSchema.properties[name] = getSchemaForType(prop.type, fields);
    }
  }

  const name = program.checker.getTypeName(model);
  if (!name || name === '(anonymous model)') return modelSchema;

  const refSchema = {
    $ref: '#/definitions/' + name,
  };

  root.definitions[name] = modelSchema;

  // next time we ask for this model, we'll just return
  // the ref schema
  knownModels.set(model, refSchema);

  return refSchema;
}

function mapADLTypeToOpenAPI(adlType) {
  switch (adlType.kind) {
    case 'Number':
    case 'String':
      return adlType.value;
    case 'Model':
      switch (adlType.name) {
        case 'int32':
          return { type: 'integer', format: 'int32' };
        case 'int64':
          return { type: 'number' };
        case 'float64':
          return { type: 'number' };
        case 'string':
          return { type: 'string' };
        case 'boolean':
          return { type: 'boolean' };
        case 'date':
          return { type: 'string' };
      }
    default:
      return false;
  }
}

function getTemplateField(type, field) {
  return program.checker.getTypeForNode(type.properties.get(field).node);
}
