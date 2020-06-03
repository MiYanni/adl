import { schema } from '../aliases/schema';
export interface PrivateEndpointConnections {
    /**
     * @description Gets the specified private endpoint connection associated with the key vault.
     * @http GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.KeyVault/vaults/{vaultName}/privateEndpointConnections/{privateEndpointConnectionName}
     * @tag PrivateEndpointConnections
     * @since 2019-09-01
     */
    Get(subscriptionId: Http.Path<string>, resourceGroupName: Http.Path<string>, vaultName: Http.Path<string & RegularExpression<"^[a-zA-Z0-9-]{3,24}$">>, privateEndpointConnectionName: Http.Path<string>, api_version: Http.Query<string, 'api-version'>): Http.Response<'200', schema, 'application/json'> | Http.Response<Http.Default, schema, 'application/json'>;
    /**
     * @description Updates the specified private endpoint connection associated with the key vault.
     * @http PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.KeyVault/vaults/{vaultName}/privateEndpointConnections/{privateEndpointConnectionName}
     * @tag PrivateEndpointConnections
     * @since 2019-09-01
     */
    Put(subscriptionId: Http.Path<string>, resourceGroupName: Http.Path<string>, vaultName: Http.Path<string & RegularExpression<"^[a-zA-Z0-9-]{3,24}$">>, privateEndpointConnectionName: Http.Path<string>, api_version: Http.Query<string, 'api-version'>, properties: Http.Body<schema, 'application/json'>): Http.Response<'200', schema, 'application/json'> | Http.Response<Http.Default, schema, 'application/json'>;
    /**
     * @description Deletes the specified private endpoint connection associated with the key vault.
     * @http DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.KeyVault/vaults/{vaultName}/privateEndpointConnections/{privateEndpointConnectionName}
     * @tag PrivateEndpointConnections
     * @since 2019-09-01
     */
    Delete(subscriptionId: Http.Path<string>, resourceGroupName: Http.Path<string>, vaultName: Http.Path<string & RegularExpression<"^[a-zA-Z0-9-]{3,24}$">>, privateEndpointConnectionName: Http.Path<string>, api_version: Http.Query<string, 'api-version'>): Http.Response<'200', schema, 'application/json'> | Http.Response<'202', any, 'application/json'> | Http.Response<'204', any, 'application/json'> | Http.Response<Http.Default, schema, 'application/json'>;
}
