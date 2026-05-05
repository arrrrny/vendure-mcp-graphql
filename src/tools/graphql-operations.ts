import { getClient, getAdminUrl, getShopUrl } from "../client.js";

/**
 * Execute a GraphQL query on the Admin API
 */
export async function adminQuery(
  queryString: string,
  variables?: Record<string, any>,
): Promise<any> {
  const client = getClient();
  return client.request(getAdminUrl(), queryString, variables);
}

/**
 * Execute a GraphQL mutation on the Admin API
 */
export async function adminMutation(
  mutationString: string,
  variables?: Record<string, any>,
): Promise<any> {
  const client = getClient();
  return client.request(getAdminUrl(), mutationString, variables);
}

/**
 * Execute a GraphQL query on the Shop API
 */
export async function shopQuery(
  queryString: string,
  variables?: Record<string, any>,
): Promise<any> {
  const client = getClient();
  return client.request(getShopUrl(), queryString, variables);
}

/**
 * Execute a GraphQL mutation on the Shop API
 */
export async function shopMutation(
  mutationString: string,
  variables?: Record<string, any>,
): Promise<any> {
  const client = getClient();
  return client.request(getShopUrl(), mutationString, variables);
}

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enums {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const operationsSummaryQuery = `
  query OperationsSummary {
    __schema {
      queryType {
        fields {
          name
          description
        }
      }
      mutationType {
        fields {
          name
          description
        }
      }
    }
  }
`;

/**
 * Fetch the Admin GraphQL schema introspection
 */
export async function getAdminSchema(): Promise<any> {
  const client = getClient();
  return client.request(getAdminUrl(), introspectionQuery);
}

/**
 * Fetch the Shop GraphQL schema introspection
 */
export async function getShopSchema(): Promise<any> {
  const client = getClient();
  return client.request(getShopUrl(), introspectionQuery);
}

/**
 * Fetch a summary of available queries and mutations for the Admin API
 */
export async function getAdminOperations(): Promise<any> {
  const client = getClient();
  return client.request(getAdminUrl(), operationsSummaryQuery);
}

/**
 * Fetch a summary of available queries and mutations for the Shop API
 */
export async function getShopOperations(): Promise<any> {
  const client = getClient();
  return client.request(getShopUrl(), operationsSummaryQuery);
}

export interface BatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
}

/**
 * Execute a GraphQL mutation in batch for multiple IDs on the Admin API.
 * Runs mutations concurrently with configurable concurrency.
 */
export async function adminBatchMutation(
  mutationString: string,
  ids: string[],
  variableName: string = "id",
  extraVariables?: Record<string, any>,
  concurrency: number = 5,
): Promise<BatchResult> {
  return executeBatch(
    getAdminUrl(),
    mutationString,
    ids,
    variableName,
    extraVariables,
    concurrency,
  );
}

/**
 * Execute a GraphQL mutation in batch for multiple IDs on the Shop API.
 * Runs mutations concurrently with configurable concurrency.
 */
export async function shopBatchMutation(
  mutationString: string,
  ids: string[],
  variableName: string = "id",
  extraVariables?: Record<string, any>,
  concurrency: number = 5,
): Promise<BatchResult> {
  return executeBatch(
    getShopUrl(),
    mutationString,
    ids,
    variableName,
    extraVariables,
    concurrency,
  );
}

async function executeBatch(
  url: string,
  mutationString: string,
  ids: string[],
  variableName: string,
  extraVariables: Record<string, any> | undefined,
  concurrency: number,
): Promise<BatchResult> {
  const client = getClient();
  const results: BatchResult["results"] = [];

  const queue = [...ids];
  let succeeded = 0;
  let failed = 0;

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift()!;
      const variables = { ...extraVariables, [variableName]: id };

      try {
        const data = await client.request(url, mutationString, variables);
        succeeded++;
        results.push({ id, success: true, data });
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : String(error);
        results.push({ id, success: false, error: message });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, ids.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return { total: ids.length, succeeded, failed, results };
}
