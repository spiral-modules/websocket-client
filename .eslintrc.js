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
    "NodeJS": true,
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'output-todo-comments',
    '@typescript-eslint',
  ],
  rules: {
    "no-shadow": "off",
    'output-todo-comments/output-todo-comments': [
      "warn", {
        'terms': ['todo'],
        'location': 'start',
      }
    ],
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
