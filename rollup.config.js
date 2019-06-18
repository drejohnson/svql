import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

const input = './src/index.js'
const globals = { graphql: 'GraphQL' }
const babelOpts = {
  exclude: '**/node_modules/**',
  runtimeHelpers: true
}

module.exports = {
  input,
  output: {
    file: pkg.main,
    format: 'cjs',
    globals
  },
  treeshake: true,
  external: Object.keys(globals),
  plugins: [
    babel(babelOpts),
    terser({
      module: true
    }),
    sizeSnapshot()
  ]
}
