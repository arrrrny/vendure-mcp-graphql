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
 * Query that fetches all operations with their return type chain and args.
 * Used by describeOperation to find a specific operation's details.
 */
const allOperationsWithTypesQuery = `
  query AllOperationsWithTypes {
    __schema {
      queryType {
        fields {
          name
          description
          args {
            name
            description
            defaultValue
            type {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
      mutationType {
        fields {
          name
          description
          args {
            name
            description
            defaultValue
            type {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
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
const typeDetailsQuery = `
  query GetTypeDetails($name: String!) {
    __type(name: $name) {
      kind
      name
      description
      fields(includeDeprecated: false) {
        name
        description
        args {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
          defaultValue
        }
        type {
          name
          kind
          ofType {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
      inputFields {
        name
        description
        type {
          name
          kind
          ofType {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        defaultValue
      }
      enumValues(includeDeprecated: false) {
        name
        description
      }
      interfaces {
        name
      }
    }
  }
`;

/**
 * Fetch details for a single type from the Admin API schema
 */
export async function getAdminTypeDetails(name: string): Promise<any> {
  const client = getClient();
  return client.request(getAdminUrl(), typeDetailsQuery, { name });
}

/**
 * Fetch details for a single type from the Shop API schema
 */
export async function getShopTypeDetails(name: string): Promise<any> {
  const client = getClient();
  return client.request(getShopUrl(), typeDetailsQuery, { name });
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

// ─── Helpers for describeOperation ───────────────────────────────

/**
 * Extract the named type name from a type chain (through NonNull/List wrappers).
 * e.g., `[ProductGroup!]!` → `ProductGroup`
 */
function extractNamedTypeName(type: any): string | null {
  if (!type) return null;
  if (type.kind !== "NON_NULL" && type.kind !== "LIST") {
    return type.name || null;
  }
  return extractNamedTypeName(type.ofType);
}

/**
 * Format a GraphQL type chain into a readable string like `[ProductGroup!]!`
 */
function formatTypeString(type: any): string {
  if (!type) return "unknown";
  switch (type.kind) {
    case "NON_NULL":
      return `${formatTypeString(type.ofType)}!`;
    case "LIST":
      return `[${formatTypeString(type.ofType)}]`;
    default:
      return type.name || "unknown";
  }
}

/**
 * Describe a GraphQL operation (query or mutation) with full details.
 *
 * Checks both Admin and Shop APIs (or just one if `api` is specified).
 * Returns the operation's arguments with input types, and its return type with fields.
 *
 * @param operationName - The name of the query or mutation
 * @param api - Optional: restrict to "admin" or "shop" only
 */
export async function describeOperation(
  operationName: string,
  api?: "admin" | "shop",
): Promise<any> {
  const apisToCheck: Array<"admin" | "shop"> = api ? [api] : ["admin", "shop"];
  const client = getClient();
  const details: any[] = [];

  for (const targetApi of apisToCheck) {
    const url = targetApi === "admin" ? getAdminUrl() : getShopUrl();

    try {
      // Step 1: Fetch all operations with type chains to find the one we need
      const schemaData = await client.request(url, allOperationsWithTypesQuery);
      const queryFields = schemaData.__schema.queryType.fields;
      const mutationFields = schemaData.__schema.mutationType.fields;

      const queryField = queryFields.find((f: any) => f.name === operationName);
      const mutationField = mutationFields.find(
        (f: any) => f.name === operationName,
      );

      if (!queryField && !mutationField) continue;

      const field = queryField || mutationField;
      const kind: "query" | "mutation" = queryField ? "query" : "mutation";

      // Step 2: Resolve the return type's fields
      const returnTypeName = extractNamedTypeName(field.type);
      let returnType: any = {
        name: formatTypeString(field.type),
        namedType: returnTypeName,
      };

      if (returnTypeName) {
        try {
          const result = await client.request(url, typeDetailsQuery, {
            name: returnTypeName,
          });
          if (result.__type) {
            returnType = {
              name: returnTypeName,
              kind: result.__type.kind,
              description: result.__type.description,
              fields: (result.__type.fields || []).map((f: any) => ({
                name: f.name,
                type: formatTypeString(f.type),
                description: f.description,
                args: f.args?.length
                  ? f.args.map((a: any) => ({
                      name: a.name,
                      type: formatTypeString(a.type),
                      description: a.description,
                      defaultValue: a.defaultValue,
                    }))
                  : undefined,
              })),
              enumValues: result.__type.enumValues,
              inputFields: result.__type.inputFields,
            };
          }
        } catch {
          // Type might be a built-in scalar - skip
        }
      }

      // Step 3: Resolve argument input types
      const argDetails = await Promise.all(
        (field.args || []).map(async (arg: any) => {
          const argTypeName = extractNamedTypeName(arg.type);
          const detail: any = {
            name: arg.name,
            type: formatTypeString(arg.type),
            description: arg.description,
            defaultValue: arg.defaultValue,
          };

          if (argTypeName) {
            try {
              const result = await client.request(url, typeDetailsQuery, {
                name: argTypeName,
              });
              if (result.__type) {
                detail.inputFields = (result.__type.inputFields || []).map(
                  (f: any) => ({
                    name: f.name,
                    type: formatTypeString(f.type),
                    description: f.description,
                    defaultValue: f.defaultValue,
                  }),
                );
                detail.inputKind = result.__type.kind;
                detail.inputDescription = result.__type.description;
              }
            } catch {
              // ignore
            }
          }

          return detail;
        }),
      );

      details.push({
        api: targetApi,
        kind,
        description: field.description,
        arguments: argDetails,
        returnType,
      });
    } catch (error) {
      details.push({
        api: targetApi,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    operation: operationName,
    availableOn: details.filter((d) => !d.error).map((d) => d.api),
    details,
  };
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
