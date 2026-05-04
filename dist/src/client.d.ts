/**
 * GraphQL Client for Vendure API
 * Handles authentication via API Key for both Admin and Shop APIs
 */
export interface GraphQLResponse<T = any> {
    data?: T;
    errors?: Array<{
        message: string;
        path?: string[];
    }>;
}
export declare class GraphQLClient {
    private apiKey;
    constructor(apiKey?: string | null);
    request<T = any>(url: string, queryString: string, variables?: Record<string, any>): Promise<T>;
}
export declare function getClient(): GraphQLClient;
export declare function getAdminUrl(): string;
export declare function getShopUrl(): string;
