module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["plugin:react/recommended", "airbnb", "prettier"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["react", "prettier"],
    rules: {
        "import/no-extraneous-dependencies": 0,
        "react/function-component-definition": [
            2,
            {
                namedComponents: "arrow-function",
                unnamedComponents: "arrow-function",
            },
        ],
        "no-use-before-define": 0,
        "no-useless-return": 0,
        "no-shadow": 0,
        "react/react-in-jsx-scope": 0,
        "react/jsx-filename-extension": 0,
    },
};
