import { items } from '@azure-tools/linq';
import { v3 } from '@azure-tools/openapi';
import { Connection, ConnectionVariable } from '../../../model/http/protocol';
import { Context } from './serializer';

export async function *processServer(server: v3.Server, $: Context): AsyncGenerator<Connection> {
  const connection = new Connection(server.url, { description: server.description });

  for (const [ name, value] of items(server.variables)) {
    const variable = new ConnectionVariable(name, {
      description: value.description,
      defaultValue: value.default,
      allowedValues: value.enum
    });

    connection.variables.push(variable);
  }

  yield connection;
}
