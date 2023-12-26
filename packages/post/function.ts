import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const postHandler = async (
  event?: PostEventProperties,
): Promise<HandlerResponse> => {
  if (!event) {
    console.error('No `event` data:', { event });
    throw Error('No `event` data.');
  }

  const {
    REGION_NAME = 'INVALID_REGION_NAME',
    BUCKET_NAME = 'INVALID_BUCKET_NAME',
  } = process.env;

  const { headers } = event;
  if (!headers) {
    console.error('No `headers` data:', { headers });
    throw Error('No `headers` data.');
  }

  const { Authorization, authorization } = headers;
  if (!Authorization && !authorization) {
    console.warn(`Not authorized:`, { Authorization, authorization });
    return {
      statusCode: 401,
      body: JSON.stringify({ error: true, message: 'Not authorized.' }),
    };
  }

  const apiKey = Authorization
    ? Authorization.replace('Bearer ', '')
    : authorization
      ? authorization.replace('Bearer ', '')
      : 'INVALID_API_KEY';

  const { queryStringParameters } = event;
  if (!queryStringParameters) {
    console.warn('Bad request:', { queryStringParameters });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: true,
        message: 'Bad request. No query parameters.',
      }),
    };
  }
  const { type } = queryStringParameters;
  if (!type) {
    console.warn('Bad request:', { type });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: true,
        message: 'Bad request. No query parameter `type`.',
      }),
    };
  }

  const key = `samples/${apiKey}/${type}.json`;

  const { body } = event;
  if (!body) {
    console.warn(`Bad request:`, { body });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: true,
        message: 'Bad request. Body is empty.',
      }),
    };
  }
  try {
    const data = JSON.parse(body);
    if (!Array.isArray(data)) {
      console.warn(`Bad request:`, { data });
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: true,
          message: 'Bad request. Body is not Array.',
        }),
      };
    }
  } catch (error) {
    console.warn(`Bad request:`, { error, body });
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: true,
        message: 'Bad request. Body is not JSON object.',
      }),
    };
  }

  const client = new S3Client({ region: REGION_NAME });
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, Body: body }),
  );

  console.debug(
    'New sample uploaded:',
    `${BUCKET_NAME}/${key}`,
    `(${body.length} bytes)`,
  );
  return {
    statusCode: 201,
    body: JSON.stringify({ success: true, message: 'New sample uploaded.' }),
  };
};
