declare module NodeJS {
  interface ProcessEnv {
    REGION_NAME?: string;
    BUCKET_NAME?: string;
  }
}
