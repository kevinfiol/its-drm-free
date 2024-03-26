import servbot from 'servbot';
import esbuild from 'esbuild';
import { resolve } from 'path';
import { annotate } from './annotate.js';
import packageJSON from '../package.json' assert { type: 'json' };

export const OUTFILE = resolve('dist/its-drm-free.user.js');
const DEV = process.argv.includes('--dev');
const ENTRY = resolve('src/index.js');

/** @type {esbuild.BuildOptions} **/
const config = {
  format: 'iife',
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  sourcemap: DEV,
  define: {
    'process.env.VERSION': `"${packageJSON.version}"`
  },
  plugins: [{
    name: 'on-end',
    setup(build) {
      build.onEnd(({ errors }) => {
        if (errors[0]) {
          logError(errors[0]);
          return;
        }

        logSuccess();
        annotate(packageJSON.version);
      });
    }
  }]
};

if (DEV) {
  const ctx = await esbuild.context(config);
  await ctx.watch();

  const server = servbot({
    root: 'dist',
    reload: false
  });

  server.listen(8081);

  process.on('exit', () => {
    ctx.dispose();
    server.close();
  });
} else {
  await esbuild.build(config);
}

function logSuccess() {
  console.log('\x1b[42m%s\x1b[0m', `Bundled: ${OUTFILE}`);
}

function logError(msg) {
  console.error('\x1b[41m%s\x1b[0m', msg)
}