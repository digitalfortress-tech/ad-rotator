# Ad-rotator [![npm version](https://badge.fury.io/js/ad-rotator.svg)](https://badge.fury.io/js/ad-rotator) [![Build Status](https://travis-ci.org/niketpathak/adRotator.svg?branch=master)](https://travis-ci.org/niketpathak/adRotator)

A fast, light-weight and highly configurable JS library to rotate advertisements.

**Ad-rotator.js**
- allows you to display advertisements to adblock users as well
- is a highly-performant library built using pure Javascript
- has NO DEPENDENCIES :D 
- supports advertisements in different sizes with many custom configuration options
- allows custom dynamic advertisements to be injected 
- a light-weight library, only [![](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/ad-rotator?compression=gzip)](https://cdn.jsdelivr.net/npm/ad-rotator) minified and gzipped
- Responsive/Optimised for mobiles/tablets
- has built-in support for _sticky_ advertisements
- is completely free and open source

---
## Install
```shell script
# you can install ad-rotator with npm
$ npm install --save ad-rotator

# Alternatively you can use Yarn
$ yarn add ad-rotator
```
Then include the library on your page.

**As a module,** 
```javascript
// using ES6 modules
import adRotator from 'ad-rotator'

// using CommonJS modules
var adRotator = require('ad-rotator')
```

**In the browser context,**
```html
<!-- Include the library -->
<script src="./node_modules/adRotator/dist/ad-rotator.js"></script>

<!-- Alternatively, you can use a CDN -->
<script src="https://cdn.jsdelivr.net/npm/ad-rotator"></script>
```
The library will be available as a global object at `window.adRotator`

## Configuration

Ad-rotator.js requires 2 mandatory parameters to be setup. A 3rd optional parameter can be provided to override default values.
- `DOM element` (required) - A container Element where the Ads should be displayed
- `Array` (required) - An Array of Advertisements(`[{url: '', img: ''},...]`) to be displayed
- `Object` (optional) - An Object with custom configuration to override default values

## Usage 

In Html, add a container Element.
```html
<head></head>
<body>
    <div id="containerElement"></div>
    <script src="https://cdn.jsdelivr.net/npm/ad-rotator"></script>
</body>
```

Then create an `Array` with the advertisements to be displayed. The array must have a similar schema.

```javascript
// An array with the advertisements to display
var items = [
    { url: 'https://niketpathak.com#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
    { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
];
```
Then Initialize **adRotator** by passing the `DOM Element` and the `Array` of advertisements as parameters
```javascript
// initialize adRotator
new AdRotator(
  document.getElementById('containerElement'),
  items
);
```
That's it! You should now have Ad-rotation in action!

## Configuration Options

ad-rotator.js is instantiated with the default configuration parameters as shown below - 
```
// Default Configuration parameters
{
    shape: "square",
    height: 300,
    width: 250,
    imgClass: "",
    linkClass: "",
    objectFit: "inherit",
    sticky: null,
    timer: 10000,
    random: true,
    static: false,
    debug: false
}
```
---

#### Description - 

1. **Shape** (default - `square`) - This is the expected shape of the Ad. It can also be set to `leaderboard` or `sidebar`. **Leaderboard** takes the standard horizontal size of advertisements (height - 90px, width - 728px) whereas **Sidebar** is used for advertisements in the sidebar with a standard size of (height - 600px, width - 300px) 
2. **Height** (default - `300` px) - The height of the advertisement
3. **Width** (default - `250` px) - The width of the advertisement
4. **imgClass** (default - `""`) - Class that should be added to the image Tag
5. **linkClass** (default - `""`) - Class that should be added to the link Tag
6. **objectFit**: (default - `inherit`) - The `object-fit` property that should be used for the image
7. **sticky**: (default - `null`) - By default, the advertisement shown is not sticky. You can make it sticky by providing a configuration object -
```javascript
sticky: {
    beforeEl: document.querySelector('.heading'),
    afterEl: document.querySelector('.summary'),
    offsetTop: '10',        // or '10px' (defaults to 30px)
    offsetBottom: '150px',  // or '150'  (defaults to 0px)
}
// beforeEl -> Element before the advertisement
// afterEl  -> Element after the advertisement
```
8. **Timer**: (default - `10000` ms). The time after which an advertisement will be rotated
9. **random**: (default - `true`) The advertisements are rotated in a random fashion by default. Set to `false` to have them rotated sequentially
10. **static**: (default - `false`) Set to `true` if you wish to disable ad-Rotation
11. **debug**: (default - `false`) Set to `true` to see error logs

---

### Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### Changelog

See the [Changelog](https://github.com/niketpathak/adRotator/wiki/Changelog)

### License

[MIT](LICENSE) © [Niket Pathak](https://niketpathak.com)