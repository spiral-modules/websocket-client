module.exports = {
  settings: {
    "import/resolver": {
       "node": {
         "extensions": [".js", ".ts"]
       }
     }
  },
  ignorePatterns: ["*.d.ts"],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "max-len": ["error", 160],
    "no-unused-vars": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "ts": "never",
      }
    ]
  },
};
