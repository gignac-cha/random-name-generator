import { getHandler } from '../get/function';
import { postHandler } from '../post/function';

export const handler = async (
  event?: EventProperties,
): Promise<HandlerResponse> => {
  if (!event) {
    console.error('No `event` data:', { event });
    throw Error('No `event` data.');
  }

  const { requestContext } = event;
  if (!requestContext) {
    console.error('No `requestContext` data:', { requestContext });
    throw Error('No `requestContext` data.');
  }

  const { http } = requestContext;
  if (!http) {
    console.error('No `http` data:', { http });
    throw Error('No `http` data.');
  }

  switch (http.method) {
    case 'GET':
      return getHandler(event);
    case 'POST':
      return postHandler(event);
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
    default:
      console.warn(`Not allowed method:`, { http });
      return {
        statusCode: 405,
        body: JSON.stringify({ error: true, message: 'Not allowed method.' }),
      };
  }
};
