/**
 * GraphQL Client for Vendure API
 * Handles authentication via API Key for both Admin and Shop APIs.
 *
 * Channel switching is done via per-channel API keys (CHANNEL_API_KEY_MAP)
 * combined with the vendure-token header. The per-channel API key provides
 * authentication scoped to the target channel, and the vendure-token header
 * tells Vendure which channel context to use for the request.
 * Both are required for proper channel switching.
 */

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export class GraphQLClient {
  constructor(
    private defaultApiKey: string | null = null,
    private channelApiKeys: Record<string, string> = {},
  ) {}

  async request<T = any>(
    url: string,
    queryString: string,
    variables?: Record<string, any>,
    channelToken?: string,
  ): Promise<T> {
    // Resolve API key: use channel-specific key if available, fall back to default
    const apiKey =
      (channelToken && this.channelApiKeys[channelToken]) || this.defaultApiKey;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["vendure-api-key"] = apiKey;
    }

    // Set vendure-token header when a channel token is provided and we have
    // a mapped API key for it (ensuring the API key has access to this channel).
    // The vendure-token header tells Vendure which channel context to use for the request.
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
  if (clientInstance) return clientInstance;

  const defaultApiKey = process.env.VENDURE_API_KEY || null;

  let channelApiKeys: Record<string, string> = {};
  const raw = process.env.CHANNEL_API_KEY_MAP;
  if (raw) {
    try {
      channelApiKeys = JSON.parse(raw);
    } catch (e) {
      console.error("Invalid CHANNEL_API_KEY_MAP JSON:", e);
    }
  }

  clientInstance = new GraphQLClient(defaultApiKey, channelApiKeys);
  return clientInstance;
}

export function getAdminUrl(): string {
  return process.env.ADMIN_API_URL || "http://localhost:3000/admin-api";
}

export function getShopUrl(): string {
  return process.env.SHOP_API_URL || "http://localhost:3000/shop-api";
}
