module.exports = {
    "extends": "eslint:recommended",
    "env": {
      "browser": true,
      "node": true,
    },
    "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 2015
    },
    "rules": {
        // enable additional rules
        "indent": ["error", 2],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],

        // override default options for rules from base configurations
        "no-cond-assign": ["error", "always"],

        // disable rules from base configurations
        "no-console": "off",
    }
}