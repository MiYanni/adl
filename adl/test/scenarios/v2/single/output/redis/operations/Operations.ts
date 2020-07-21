import { ApiVersionParameter } from "../aliases/ApiVersionParameter";
import { OperationListResult } from "../models/OperationListResult";
export interface Operations {
    /**
     * @description Lists all of the available REST API operations of the Microsoft.Cache provider.
     * @since 2018-03-01
     * @http GET /providers/Microsoft.Cache/operations
     * @tag Operations
     * @return 200 - Success. The response describes the list of operations.
     */
    List(api_version: ApiVersionParameter, body?: Body<file, "application/json">): [(code: 200, mediaType: "application/json") => {
        body: OperationListResult;
    }];
}