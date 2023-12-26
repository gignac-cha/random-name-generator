declare type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

declare interface HTTP {
  method: HTTPMethod;
}

declare interface RequestContext {
  http: HTTP;
}

declare interface EventProperties {
  requestContext: RequestContext;
}

// declare interface MultiValueQueryStringParameters {
//   type?: string[];
// }
declare interface GetEventProperties extends EventProperties {
  queryStringParameters?: QueryStringParameters;
  // multiValueQueryStringParameters?: MultiValueQueryStringParameters;
  headers?: Record<string, string | undefined>;
}

declare interface QueryStringParameters {
  type?: string;
}
declare interface PostEventProperties extends EventProperties {
  queryStringParameters?: QueryStringParameters;
  headers?: Record<string, string | undefined>;
  body?: string;
}
