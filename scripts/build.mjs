import { build } from 'esbuild';

build({
  entryPoints: ['packages/endpoint/function.ts'],
  outfile: 'dist/function.js',
  platform: 'node',
  target: 'node20',
  bundle: true,
  minify: false,
  external: ['@aws-sdk/client-s3'],
});
