const path = require('path');

module.exports = {
  "mode": "development",
  "entry": "./src/ad-rotator.js",
  "output": {
    path: path.resolve(__dirname, "dist"),
    "filename": "ad-rotator.js",
    library: 'adRotator',
    libraryExport: 'default'    // to export only the default fn
  },
  "devtool": "source-map",
  "module": {
    "rules": [
      {
        "enforce": "pre",
        "test": /\.(js|jsx)$/,
        "exclude": /node_modules/,
        "use": "eslint-loader"
      },
      {
        "test": /\.js$/,
        "exclude": /node_modules/,
        "use": {
          "loader": "babel-loader",
          "options": {
            "presets": [
              "@babel/preset-env"
            ]
          }
        }
      },
      {
        "test": /\.less$/,
        "use": [
          "css-loader",
          "less-loader"
        ]
      }
    ]
  }
}