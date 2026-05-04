/**
 * GraphQL Client for Vendure API
 * Handles authentication via API Key for both Admin and Shop APIs
 */
export class GraphQLClient {
    apiKey;
    constructor(apiKey = null) {
        this.apiKey = apiKey;
    }
    async request(url, queryString, variables) {
        const headers = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) {
            headers["vendure-api-key"] = this.apiKey;
        }
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                query: queryString,
                variables,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${text}`);
        }
        const result = (await response.json());
        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors.map((e) => e.message).join(", "));
        }
        return result.data;
    }
}
// Singleton instance
let clientInstance = null;
export function getClient() {
    if (clientInstance) {
        return clientInstance;
    }
    const apiKey = process.env.VENDURE_API_KEY || null;
    clientInstance = new GraphQLClient(apiKey);
    return clientInstance;
}
export function getAdminUrl() {
    return process.env.ADMIN_API_URL || "http://localhost:3000/admin-api";
}
export function getShopUrl() {
    return process.env.SHOP_API_URL || "http://localhost:3000/shop-api";
}
