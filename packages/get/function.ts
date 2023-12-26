import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const getHandler = async (
  event?: GetEventProperties,
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
    console.debug('No `Authorization` header.');
  }
  const apiKey = Authorization
    ? Authorization.replace('Bearer ', '')
    : authorization
      ? authorization.replace('Bearer ', '')
      : '_';
  // const { multiValueQueryStringParameters } = event;
  // if (!multiValueQueryStringParameters) {
  //   console.warn('Bad request:', { multiValueQueryStringParameters });
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify({
  //       error: true,
  //       message: 'Bad request. No query parameters.',
  //     }),
  //   };
  // }
  // const { type: types } = multiValueQueryStringParameters;
  // if (!types || !Array.isArray(types)) {
  //   console.warn('Bad request:', { types });
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify({
  //       error: true,
  //       message: 'Bad request. No query parameter `type`.',
  //     }),
  //   };
  // }
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
  const types = type.split(',');

  const randomChoice = (values: string[]): string =>
    values[Math.floor(Math.random() * values.length)];

  const getObject = async (type: string): Promise<string[]> => {
    const key = `samples/${apiKey}/${type}.json`;

    const client = new S3Client({ region: REGION_NAME });
    const { Body } = await client.send(
      new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    );

    const body = await Body?.transformToString();

    if (!body) {
      console.error('Data is not JSON object.', { body });
      throw Error('Data is not JSON object.');
    }

    try {
      const data = JSON.parse(body);

      if (!Array.isArray(data)) {
        console.error('Data is not array.', { data });
        throw Error('Data is not array.');
      }

      return data;
    } catch (error) {
      console.error('Data is not JSON object.', { error, body });
      throw Error('Data is not JSON object.');
    }
  };

  // const values: string[] = await Promise.all(
  //   types.map((type: string) =>
  //     getObject(type).then((values: string[]) => randomChoice(values)),
  //   ),
  // );
  // const name = values.join(' ');
  // console.debug('Generated name:', { apiKey, types, name });
  const map = new Map<string, string>();
  for (const type of types) {
    const object = await getObject(type);
    const value = randomChoice(object);
    map.set(type, value);
  }
  const result = Object.fromEntries(map);
  const name = types.map((type: string) => map.get(type)).join(' ');
  const body = JSON.stringify({
    result,
    name,
  });
  console.debug('Generated name:', { apiKey, types, name, result });

  return {
    statusCode: 200,
    body,
  };
};
