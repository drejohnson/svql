import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

const babelOpts = {
  exclude: '**/node_modules/**',
  runtimeHelpers: true
}

export default [
  {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules ||
        Object.keys(process.binding('natives'))
    ),
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      babel(babelOpts),
      terser({
        module: true
      }),
      sizeSnapshot()
    ],
    treeshake: true
  }
]

// const input = './src/index.js'
// const babelOpts = {
//   exclude: '**/node_modules/**',
//   runtimeHelpers: true
// }

// module.exports = {
//   input,
//   output: {
//     file: pkg.main,
//     format: 'cjs'
//   },
//   treeshake: true,
//   external: [...Object.keys(pkg.peerDependencies || {})],
//   plugins: [
//     resolve({
//       jsnext: true
//     }),
//     commonjs(),
//     replace({
//       'process.env.NODE_ENV': JSON.stringify('production')
//     }),
//     babel(babelOpts),
//     terser({
//       compress: {
//         pure_getters: true,
//         unsafe: true,
//         unsafe_comps: true,
//         warnings: false
//       }
//     }),
//     sizeSnapshot()
//   ]
// }
