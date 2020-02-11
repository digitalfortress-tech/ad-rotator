# Ad-rotator [![npm version](https://badge.fury.io/js/ad-rotator.svg)](https://badge.fury.io/js/ad-rotator) [![Build Status](https://travis-ci.org/niketpathak/adRotator.svg?branch=master)](https://travis-ci.org/niketpathak/adRotator)

A fast, light-weight and highly configurable JS library to rotate advertisements.

**Ad-rotator.js**
- is a highly-performant library in pure Javascript
- has NO DEPENDENCIES :D 
- allows you to **display advertisements to adblock users** as well
- allows custom dynamic advertisements to be injected 
- a light-weight library, only [![](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/ad-rotator?compression=gzip)](https://cdn.jsdelivr.net/npm/ad-rotator) minified and gzipped
- supports advertisements in different sizes with many custom configuration options
- Responsive/Optimised for mobiles & tablets
- has built-in support for **_sticky_ advertisements**
- is completely free and open source

---
## Install
```shell script
# you can install ad-rotator with npm
$ npm install --save ad-rotator

# Alternatively you can use Yarn
$ yarn add ad-rotator
```
Then include the library in your App/Page.

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
- `Array` (required) - An Array of Advertisements(`[{url: '', img: ''},...]`) to be displayed. `img` can be an absolute URL, a relative URL or even a base-64 encoded image.
- `Object` (optional) - An Object with custom configuration to override default values

## Usage 

In Html, add a container Element.
```html
<div id="containerElement"></div>
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
var rotator = new AdRotator(
  document.getElementById('containerElement'),
  items
);
// start the rotation
rotator.start(); 
```
That's it! You should now have Ad-rotation in action! By default, the Ads are rotated in a random fashion. See configuration options for more variations

### API

* [`AdRotator.start()`](#adrotatorstart)
* [`AdRotator.pause()`](#adrotatorpause)
* [`AdRotator.resume()`](#adrotatorresume)
* [`AdRotator.add()`](#adrotatoradd)
* [`AdRotator.remove()`](#adrotatorremove)
* [`AdRotator.destroy()`](#adrotatordestroy)


#### AdRotator.`start()`

Starts the Ad-Rotation

```javascript
const rotator = new AdRotator(
    document.getElementById('containerElement'),
    [
        { url: 'https://niketpathak.com#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
        { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
    ],
    {shape: "sidebar"}    // configuration options
);
rotator.start(); // starts the animation
```

#### AdRotator.`pause()`

Pauses the Rotation. 
```javascript
const rotator = new AdRotator( /* options */ )
rotator.pause();        // pauses the rotation
```
To resume the rotation, simply call `AdRotatorInstance.resume()`

#### AdRotator.`resume()`

Pauses the Rotation. 
```javascript
const rotator = new AdRotator( /* options */ )
rotator.resume();        // resumes the rotation
```
To resume the rotation, simply call `AdRotatorInstance.resume()`


#### AdRotator.`add()`

Inject a new Advertisement into the AdRotator.
```javascript
const rotator = new AdRotator( /* options */ )
rotator.add(
  {
    url: 'https://digitalfortress.tech',
    img: './path-to-img'
  } 
);        
```

#### AdRotator.`remove()`

Remove an item from the Advertisements array. 
```javascript
const rotator = new AdRotator( /* options */ )
rotator.remove(); // remove the last item
rotator.rotate(   // remove a specific item
  {
    url: 'https://digitalfortress.tech', // url is optional
    img: './path-to-img'
  } 
);        
```
The `remove()` method deletes the last item in the advertisements array. To remove a particular advertisement, you can also pass it a parameter (**`rotatorInstance.remove({ img: 'xyz.gif'})`**). The change in the Advertisements array will be reflected in the next rotation cycle

#### AdRotator.`destroy()`

Destroy the AdRotator instance. Removes the associated adverts from the DOM.

```javascript
const rotator = new AdRotator( /* options */ )
rotator.destroy();        // destroys the rotation+DOM
```
To reactivate AdRotator, simply call `AdRotatorInstance.start()`


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
    newTab: false
}
```
---

#### Description - 

1. **Shape** (default - `square`) - This is the expected shape of the Ad. It can also be set to `leaderboard` or `sidebar`. **Leaderboard** takes the standard horizontal size of advertisements (height - 90px, width - 728px) whereas **Sidebar** is used for advertisements in the sidebar with a standard size of (height - 600px, width - 300px) 
2. **Height** (default - `300` _px_) - The height of the advertisement
3. **Width** (default - `250` _px_) - The width of the advertisement
4. **imgClass** (default - `""`) - Class that should be added to the image Tag
5. **linkClass** (default - `""`) - Class that should be added to the link Tag
6. **objectFit**: (default - `inherit`) - The `object-fit` property that should be used for the image (`inherit`,`contain`,`cover`, `fill`,...)
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
8. **Timer**: (default - `10000` _ms_). The time after which an advertisement will be rotated
9. **random**: (default - `true`) The advertisements are rotated in a random fashion by default. Set to `false` to have them rotated sequentially
10. **newTab**: (default - `false`) Set to `true` to open the advertisement URL in a new Tab

#### Note
It is also possible to change configuration options after instantiation. (The only exception being that changing the `shape` option will not automatically change the `height` & `width` options) 
```javascript
// init AdRotator with default options
const rotator = new AdRotator( /* options */ )
// update config to change to sequential rotation
rotator.conf.random = false; 
```
---

### Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### Changelog

See the [Changelog](https://github.com/niketpathak/adRotator/wiki/Changelog)

### License

[MIT](LICENSE) © [Niket Pathak](https://niketpathak.com)