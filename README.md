# Ad-rotator [![npm version](https://badge.fury.io/js/ad-rotator.svg)](https://badge.fury.io/js/ad-rotator) [![Build Status](https://travis-ci.org/niketpathak/adRotator.svg?branch=master)](https://travis-ci.org/niketpathak/adRotator) ![Downloads](https://img.shields.io/npm/dt/ad-rotator) ![maintained](https://img.shields.io/maintenance/yes/2020) [![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT)

A fast, light-weight and highly configurable JS library to rotate advertisements.

**Ad-rotator.js**
- is a vastly performant library in pure Javascript
- has **NO DEPENDENCIES** :D 
- allows you to **display native advertisements to adblock users** as well
- enables custom dynamic advertisements to be injected 
- is a light-weight library, only [![](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/ad-rotator?compression=gzip)](https://cdn.jsdelivr.net/npm/ad-rotator) minified and gzipped
- supports **multiple ads** with different shapes/sizes customizable to the very pixel
- Enables you to display **device specific ads** i.e. ads targeted towards mobile/desktop
- uses `IntersectionObserver API` to improve performance & reduce browser paints.
- Provides **custom callbacks** that can be used for analytics, statistics, logging, etc... 
- has built-in support for **sticky advertisements**
- Responsive/Optimised for mobiles & tablets
- supports almost every browser! (*Only IE is unsupported, but you may use a [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill))
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
var adRotator = require("ad-rotator")
```

**In the browser context,**
```html
<!-- Include the library -->
<script src="./node_modules/ad-rotator/dist/ad-rotator.js"></script>

<!-- Alternatively, you can use a CDN -->
<script src="https://cdn.jsdelivr.net/npm/ad-rotator"></script>
```
The library will be available as a global object at `window.adRotator`

## Configuration

Ad-rotator.js requires 2 mandatory parameters to be setup. A 3rd optional parameter can be provided to override default values.
- **`DOM element` (required)** - A container Element where the Ads should be displayed
- **`Array` (required)** - An Array of Advertisements(`[{url: '', img: ''},...]`) to be displayed. Each advertisement is expected to be an object with 2 mandatory keys `img` and `url` -
```javascript
let items = [
  {img: './assets/image.jpg', url: 'https://xyz.com#1'},              // ad 1
  {img: 'https://xyz.com/image.png', url: 'https://xyz.com#2'},       // ad 2
  {img: 'https://xyz.com/image.svg', url: 'https://xyz.com#3'},       // ad 3
  {img: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', url: 'https...'}  // ad 4
]
```

`img` can be an absolute URL, a relative URL or even a base-64 encoded image.
- **`Object` (optional)** - An Object with custom configuration options to override default values. (See all **[`configuration options`](#configurationoptions)**)

## Usage 

In Html, add a container Element.
```html
<div id="containerElement"></div>
```

Then create an `Array` with the advertisements to be displayed.

```javascript
// An array with the advertisements to display
let items = [
    { url: 'https://niketpathak.com#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
    { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
];
```
Then Initialize **adRotator** by passing the `DOM Element` and the `Array` of advertisements as parameters
```javascript
// initialize adRotator
const rotator = new adRotator(
  document.getElementById('containerElement'),
  items,
  { debug: true }       // optional
);
// start the rotation
rotator.start(); 
```
That's it! You should now have Ad-rotation in action! By default, the Ads are rotated in a random fashion. See [`configuration options`](#configurationoptions) for more variations. 


_**_NOTE:_**_ By default, `adRotator` is designed to **fail silently** for any configuration error. This means that it will neither pollute the DOM nor will it attach any events in case of an error. It will also not log any console error messages. This can make it difficult to diagnose an error, hence during initial setup/development, it is recommended to turn on the `{debug: true}` config option. 

### API

* [`adRotator.start()`](#adrotatorstart)
* [`adRotator.pause()`](#adrotatorpause)
* [`adRotator.resume()`](#adrotatorresume)
* [`adRotator.add()`](#adrotatoradd)
* [`adRotator.remove()`](#adrotatorremove)
* [`adRotator.destroy()`](#adrotatordestroy)


#### <a id="adrotatorstart">adRotator.`start()`</a>

Starts the Ad-Rotation

```javascript
const rotator = new adRotator(
    document.getElementById('containerElement'),
    [
        { url: 'https://gospelmusic.io#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
        { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
    ],
    {shape: "sidebar"}    // configuration options
);
rotator.start(); // starts the rotation
```

#### <a id="adrotatorpause">adRotator.`pause()`</a>

Pauses the Rotation. However, if the user clicks/hovers the Ad or scrolls away from the Ad such that it is not visible anymore & then scrolls back to it, rotation will resume automatically. Rotation cannot be paused permanently because that would beat the purpose of this library.
```javascript
const rotator = new adRotator( /* options */ )
rotator.pause();                  // pauses the rotation

/* You can also use "pause" in the cb(callback) config option to 
 * pause every advertisement after it has been clicked/hovered upon, 
 * or after it has been scrolled out of view.
 */
rotator.conf.cb = rotator.pause;
```
See [cb(callback) config option](#configurationoptions) for further details on its usage.

To resume the rotation, simply call `adRotatorInstance.resume()`

#### <a id="adrotatorresume">adRotator.`resume()`</a>

Resumes the Rotation. 
```javascript
const rotator = new adRotator( /* options */ )
rotator.pause();
rotator.resume();        // resumes the rotation
```
Use `adRotatorInstance.resume()` to resume a paused rotation.


#### <a id="adrotatoradd">adRotator.`add()`</a>

Inject a new Advertisement into the adRotator.
```javascript
const rotator = new adRotator( /* options */ )
rotator.add(
  {
    url: 'https://gospelmusic.io',
    img: './path-to-img'
  } 
);        
```
The newly injected Advertisement will be displayed in the next rotation cycle

#### <a id="adrotatorremove">adRotator.`remove()`</a>

Remove an item from the Advertisements array. 
```javascript
const rotator = new adRotator( /* options */ )
rotator.remove(); // remove the last item
rotator.remove(   // remove a specific item
  {
    url: 'https://digitalfortress.tech', // url is optional
    img: './path-to-img'
  } 
);        
```
The `remove()` method deletes the last item in the advertisements array. To remove a particular advertisement, you can also pass it a parameter (**`rotatorInstance.remove({ img: 'xyz.gif'})`**). The change in the Advertisements array will be reflected in the next rotation cycle

#### <a id="adrotatordestroy">adRotator.`destroy()`</a>

Destroys Ad Rotation. Cleans up the DOM and removes all associated events.

```javascript
const rotator = new adRotator( /* options */ )
rotator.destroy();        // destroys the rotation, DOM and events
```
To reactivate adRotator, simply call `adRotatorInstance.start()`


## <a id="configurationoptions">Configuration Options</a>

ad-rotator.js is instantiated with the default configuration parameters as shown below - 
```javascript
// Default Configuration parameters
{
    shape: "square",
    height: 300,
    width: 250,
    timer: 5000,
    target: "all",
    cb: null,
    onHover: null,
    onClick: null,
    imgClass: "",
    linkClass: "",
    objectFit: "inherit",
    random: true,
    newTab: false,
    debug: false,
    sticky: null,
}
```
---

#### Description - 

1. **Shape** (_`String`_, default - `"square"`) - This is the expected shape of the Ad. It can also be set to `square`, `leaderboard`, `sidebar` or `mobile`. By default, the shape is set to **square** with a height of 300px and width of 250px. When set to **Leaderboard**, the standard horizontal size of height - 90px, width - 728px is used, when shape is set to **Sidebar**, the standard size of height - 600px, width - 300px is used and when the shape is set to **Mobile**, the width is set to the width of the container Element & the height is set to 90px. (These default values can be overriden). Setting shape to `mobile` also sets the `target` device to mobile, which means the ads in this instance will only be visible on a mobile device. You can also set the shape to **custom** in which case you must provide the height/width config options.
2. **Height** (_`Int`_, default - `300` _px_) - The height of the advertisement
3. **Width** (_`Int`_, default - `250` _px_) - The width of the advertisement
4. **timer**: (_`Int`_, default - `5000` _ms_). The time after which an advertisement will be rotated
5. **target**: (_`String`_, default - `all`). The target device. Can be set to `desktop`, `mobile` or `all`. When set to desktop, ads will be shown only on a desktop device whereas when set to mobile, ads will be displayed on a mobile device alone. By default, ads are shown on all devices.
6. **cb**: (_`function | null`_, default - `null`) - A **callback** that is executed on every image rotation. The callback receives 3 parameters `cb(currentAdUnit, parentElement, configParams)`. This callback can be used for analytics, to programmatically control the rotator instance or for any other purpose.
7. **onHover**: (_`function | null`_, default - `null`) - A **callback** that is executed on hovering over an Ad unit. The callback receives 2 parameters `cb(currentAdUnit, parentElement)`.
8. **onClick**: (_`function | null`_, default - `null`) - A **callback** that is executed on clicking an Ad unit. The callback receives 2 parameters `cb(event, currentAdUnit)`.
9. **imgClass** (_`String`_, default - `""`) - Class that should be added to the image Tag
10. **linkClass** (_`String`_, default - `""`) - Class that should be added to the link Tag
11. **objectFit**: (_`String`_, default - `"inherit"`) - The `object-fit` property that should be used for the image (`inherit`,`contain`,`cover`, `fill`,...)
12. **random**: (_`Bool`_, default - `true`) The advertisements are rotated in a random fashion by default. Set to `false` to have them rotated sequentially
13. **newTab**: (_`Bool`_, default - `false`) Set to `true` to open the advertisement URL in a new Tab
14. **debug**: (_`Bool`_, default - `false`) Set to `true` to see error information in the console. Recommended to turn this on during setup/development.
15. **sticky**: (_`Object|null`_, default - `null`) - By default, the advertisement shown is not sticky. To enable sticky advertisements, pass an empty object `sticky: {}`. You can customize sticky advertisements by providing the following configuration properties -
```javascript
sticky: {
    beforeEl: document.querySelector('.start'),
    afterEl: document.querySelector('.end'),
    offsetTop: '10',        // or '10px' (defaults to 0px)
    offsetBottom: '150px',  // or '150'  (defaults to 0px)
    noMobile: true          // disable stickiness on mobile (defaults to false)
}
// beforeEl => Element after which the Ad becomes sticky
// afterEl => Element before which Ad stops being sticky
```
A css class **`stickyElx`** is added dynamically to the sticky Element's container to allow further fine-tuning such as customizing css properties (like z-index), using media queries and so on.

---

#### Note
It is possible to change configuration options after instantiation. 
```javascript
// init adRotator with default options
const rotator = new adRotator( /* options */ )
// update config after instantiation to change to sequential rotation
rotator.conf.random = false; 
```
The only 2 exceptions are: 
- Updating the `shape` config option will not automatically update the `height` & `width` config options as it does during instantiation. 
- Updating the `shape` to `mobile` will not automatically set the `target` device to mobile as it does during instantiation.
---

### Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### Changelog

See the [Changelog](https://github.com/niketpathak/adRotator/wiki/Changelog)

### License

[MIT](LICENSE) © [Niket Pathak](https://niketpathak.com)