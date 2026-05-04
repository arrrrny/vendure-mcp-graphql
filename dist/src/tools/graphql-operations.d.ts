/**
 * Execute a GraphQL query on the Admin API
 */
export declare function adminQuery(queryString: string, variables?: Record<string, any>): Promise<any>;
/**
 * Execute a GraphQL mutation on the Admin API
 */
export declare function adminMutation(mutationString: string, variables?: Record<string, any>): Promise<any>;
/**
 * Execute a GraphQL query on the Shop API
 */
export declare function shopQuery(queryString: string, variables?: Record<string, any>): Promise<any>;
/**
 * Execute a GraphQL mutation on the Shop API
 */
export declare function shopMutation(mutationString: string, variables?: Record<string, any>): Promise<any>;
/**
 * Fetch the Admin GraphQL schema introspection
 */
export declare function getAdminSchema(): Promise<any>;
/**
 * Fetch the Shop GraphQL schema introspection
 */
export declare function getShopSchema(): Promise<any>;
/**
 * Fetch a summary of available queries and mutations for the Admin API
 */
export declare function getAdminOperations(): Promise<any>;
/**
 * Fetch a summary of available queries and mutations for the Shop API
 */
export declare function getShopOperations(): Promise<any>;
