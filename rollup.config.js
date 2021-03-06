import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [
  replace({
    __DEV__: `process.env.NODE_ENV !== 'production'`,
    __VERSION__: pkg.version,
  }),
  nodeResolve(),
  commonjs(),
  typescript(),
  getBabelOutputPlugin({
    presets: [['@babel/preset-env', { useBuiltIns: 'usage', targets: { node: "8" }, corejs: 3 }]],
    allowAllFormats: true
  }),
]


const core = {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.common.js',
      format: 'cjs',
    },
    {
      file: './dist/index.esm.js',
      format: 'esm',
    },
    {
      name: 'UpdateNotice',
      file: './dist/index.umd.js',
      format: 'umd',
    },
  ],
  plugins,
}


export default [core]
