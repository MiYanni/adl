import { Method, Rule } from '@azure-tools/adl.core';
export default <Rule>{
  activation: 'edit',
  meta: {
    severity: 'warning',
    description: 'DELETE operation should use the method name \'delete\'',
    documentationUrl: 'https://github.com/Azure/azure-rest-api-specs/blob/master/documentation/openapi-authoring-automated-guidelines.md#r1009-deleteinoperationname',

  },
  onOperation: (model, operation) => {
    const name = operation.name;
    if (operation.method === Method.Delete && name !== 'delete') {
      return {
        message: `The operation name '${name}' is not allowed. Make sure that operation name for DELETE operation is 'delete'.`,
        suggestions: [
          {
            description: 'Rename the operation to delete.',
            fix: () => {
              operation.name = 'delete';
            }
          }
        ]
      };
    }

    return;
  }
};