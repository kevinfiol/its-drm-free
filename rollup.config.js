import fs from 'fs';
import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import MagicString from 'magic-string';
import serve from 'rollup-plugin-serve';

const isDev = process.env.ROLLUP_WATCH;
const isProd = !isDev;

const annotations = fs.readFileSync(path.join(__dirname, 'annotations.txt'), 'utf8');
const prependBanner = (options = {}) => ({
    renderChunk: code => {
        if (options.banner && typeof options.banner === 'string') {
            const content = options.banner;
            const magicStr = new MagicString(code);
            const hasSourceMap = options.sourceMap !== false && options.sourcemap !== false;

            magicStr.prepend(content + '\n');
            const result = { code: magicStr.toString() };

            if (hasSourceMap) {
                result.map = magicStr.generateMap({ hires: true });
            }
            
            return result;
        }
    }
});

const config = {
    input: './src/index.js',
    output: {
        file: './dist/its-drm-free.user.js',
        format: 'iife',
        sourcemap: isDev
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        prependBanner({ banner: annotations }),
        // Development-only Plugins
        isDev && serve('dist')
    ]
};

export default config;