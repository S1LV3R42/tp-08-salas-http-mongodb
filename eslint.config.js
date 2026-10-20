const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        files: ["src/**/*.js", "scripts/**/*.js"],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: { console: 'readonly', process: 'readonly', __dirname: 'readonly' }
        },
        rules: { 'no-unused-vars': 'warn', 'no-console': 'off' }
    }
];
