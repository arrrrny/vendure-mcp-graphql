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
