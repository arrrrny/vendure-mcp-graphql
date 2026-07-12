/**
 * GraphQL Client for Vendure API
 * Handles authentication via API Key for both Admin and Shop APIs
 */

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export class GraphQLClient {
  constructor(private apiKey: string | null = null) {}

  async request<T = any>(
    url: string,
    queryString: string,
    variables?: Record<string, any>,
    channelToken?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["vendure-api-key"] = this.apiKey;
    }

    if (channelToken) {
      headers["vendure-token"] = channelToken;
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

    const result = (await response.json()) as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map((e) => e.message).join(", "));
    }

    return result.data as T;
  }
}

// Singleton instance
let clientInstance: GraphQLClient | null = null;

export function getClient(): GraphQLClient {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.VENDURE_API_KEY || null;
  clientInstance = new GraphQLClient(apiKey);
  return clientInstance;
}

export function getAdminUrl(): string {
  return process.env.ADMIN_API_URL || "http://localhost:3000/admin-api";
}

export function getShopUrl(): string {
  return process.env.SHOP_API_URL || "http://localhost:3000/shop-api";
}
