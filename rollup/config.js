import React from 'react';
import ReactDOM from 'react-dom';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import copy from 'rollup-plugin-copy';

import pkg from '../package.json';
import template from './template';

const { BUILD } = process.env;
const isDev = BUILD === 'dev';
const isDemo = BUILD === 'demo';
const isDist = BUILD === 'dist';

const cjs = {
  file: isDist ? pkg.main : 'src/.dev/bundle.js',
  format: 'cjs',
  sourcemap: isDev
};

const esm = {
  file: pkg.module,
  format: 'esm'
};

const extensions = ['.js', '.ts', '.tsx', '.json'];
const plugins = [
  resolve({ extensions }),
  commonjs({
    namedExports: {
      react: Object.keys(React),
      'react-dom': Object.keys(ReactDOM)
    }
  }),
  babel({ exclude: 'node_modules/**', extensions }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
  }),
  !isDist && url(),
  !isDist && postcss({ extract: true, sourceMap: isDev, minimize: !isDev }),
  !isDist && html({ template }),
  !isDist &&
    copy({
      targets: [
        { src: 'src/static/demo_assets', dest: 'src/.dev', rename: 'assets' }
      ]
    }),
  isDev && serve('src/.dev'),
  isDev && livereload(),
  !isDev && terser(),
  !isDev && filesize(),
  isDemo &&
    copy({
      targets: [{ src: 'src/.dev', dest: '.', rename: 'demo' }],
      hook: 'writeBundle'
    }),
  isDist &&
    copy({
      targets: [
        {
          src: 'src/types/react-cool-onclickoutside.d.ts',
          dest: pkg.types.split('/')[0],
          rename: 'index.d.ts'
        }
      ]
    })
];

export default {
  input: isDist ? 'src/useOnclickOutside' : 'src',
  output: isDist ? [cjs, esm] : [cjs],
  plugins,
  external: isDist ? Object.keys(pkg.peerDependencies) : []
};
