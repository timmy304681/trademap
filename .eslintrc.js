module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 允許function內傳進去的argument能直接給予新property
    'no-param-reassign': ['error', { props: false }],
    // 允許function可以不用在使用前先寫
    'no-use-before-define': ['error', { functions: false, classes: true }],
    // 允許array, object最後不需要comma
    'comma-dangle': ['error', 'never'],
    // 允許使用 for-of
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    // 允許for-loop裡面有continue
    'no-continue': 0,
    // 允許一個file有多個class
    'max-classes-per-file': ['error', 5],
  },
};
