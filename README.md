# Ad-rotator
[![npm version](https://img.shields.io/npm/v/ad-rotator.svg)](https://www.npmjs.com/package/ad-rotator)
[![Build Status](https://github.com/digitalfortress-tech/ad-rotator/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/digitalfortress-tech/ad-rotator/actions/workflows/ci.yml)
[![code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![CDN hits](https://data.jsdelivr.com/v1/package/npm/ad-rotator/badge?style=rounded)](https://www.jsdelivr.com/package/npm/ad-rotator)
[![Downloads](https://img.shields.io/npm/dt/ad-rotator)](https://npm-stat.com/charts.html?package=ad-rotator)
![maintained](https://img.shields.io/badge/maintained-yes-blueviolet)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal)](https://www.paypal.com/donate/?hosted_button_id=PZ5ULVZBZX55A)

A fast, light-weight and highly configurable JS library to rotate advertisements.

**🌟 Features 🌟**

- 📦 Has **0 DEPENDENCIES**! Written in pure JS (typescript).
- 🖼 Display **native advertisements to adblock users**
- 🔥 A super light-weight library, only [![<3Kb minzipped](https://img.shields.io/bundlephobia/minzip/ad-rotator)](https://bundlephobia.com/package/ad-rotator)
- 📳 Supports completely **responsive multiple ad instances** customizable to the very pixel
- 💻 Display **device specific ads** i.e. ads targeted towards mobile/desktop
- 🪝 Provides **hooks/callbacks** that can be used for analytics, statistics, logging, etc...
- 🧲 Built-in support for **sticky advertisements**
- ⚖️ Assign weight/**priority** to Ad unit(s) to increase its chances of being shown
- ⚜️ Has a Fallback Mode i.e. kicks in only when your primary Ad network fails (for example, due to an Adblocker)
- 🌐 Supports every major browser!
- 🎀 Framework agnostic, free and open source

---
### ✨ Demo

Here is a **[Live Demo](https://rotator.digitalfortress.tech/)** of Ad-rotation in action. You will find **live examples** that can tinkered with to get a clearer picture about what you could expect from this library.

---
## <a id="installLink">➕ Install</a>

```shell script
# you can install ad-rotator with npm
$ npm install --save ad-rotator

# Alternatively you can use Yarn or PNPM
$ yarn add ad-rotator
$ pnpm add ad-rotator
```
Then include the library in your App/Page.

**As a module,**
```javascript
// using ES6 modules
import { init, stickyEl } from 'ad-rotator';   // imports library
import 'ad-rotator/dist/style.css'; // imports base style (optional)

// using CommonJS modules
const rotator = require('ad-rotator');
require('ad-rotator/dist/style.css');
```

**In the browser context,**
```html
<!-- Include the library -->
<script src="./node_modules/ad-rotator/dist/rotator.umd.js"></script>
<!-- Optionally include the base style -->
<link rel="stylesheet" href="./node_modules/ad-rotator/dist/style.css" />


<!-- Alternatively, you can use a CDN -->
<script src="https://cdn.jsdelivr.net/npm/ad-rotator"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ad-rotator/dist/style.css" /> <!-- Optional -->

<!-- or with unpkg.com to get a specific version -->
<script src="https://unpkg.com/ad-rotator@5.8.0/dist/ad-rotator.js"></script>
<link rel="stylesheet" href="https://unpkg.com/ad-rotator@5.8.0/dist/style.css" /> <!-- Optional -->

```
The library will be available as a global object at **`window.rotator`**

## 🔧 Configuration

Ad-rotator.js requires 2 mandatory parameters to be setup. A 3rd optional parameter can be provided to override default values.
- **`DOM element` (required)** - A container Element where the Ads should be displayed
- **`Array` (required)** - An Array of Advertisements(`[{url: '', img: ''},...]`) to be displayed. Each advertisement is expected to be an object with 2 mandatory properties `img` and `url`
<details>
  <summary>
  <b>Details & Example of an Array of Ads</b>
  </summary>

- **`img` (required)** - Its value can be an absolute URL, a relative URL or even a base-64 encoded image.
- **`url` (required)** - It is the target url where the end-user will be directed on clicking the Ad.
- **`weight` (optional)** - This property behaves differently depending on whether you are using sequential/random rotation. For sequential rotation, ads will be sorted by weight i.e. highest weight to the lowest weight. For random Ad rotation, weight adds a priority to each item. The higher the weight, the higher the chances of that Ad being shown first.
- **`title` (optional)** - This property can be used to provide a small text describing the image/Ad. It is used to improve accessibility via aria-attributes and also to improve SEO.


```javascript
/* Example of an array of Ads */
let items = [
  {img: './assets/image.jpg', url: 'https://xyz.com#1', title: 'Ad 1'},                    // ad 1
  {img: 'https://xyz.com/image.png', url: 'https://xyz.com#2', weight: 5},  // ad 2
  {img: 'https://xyz.com/image.svg', url: 'https://xyz.com#3', weight: 10}, // ad 3
  {img: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', url: 'https...'}        // ad 4
]
```
</details>

- **`Object` (optional)** - An Object with custom configuration options to override default values. (See all **[`configuration options`](#configurationoptions)**)

## 🌱 Usage

In Html, create an Element. This element will be used as a **container** to inject Ads.

```html
<div id="containerElement"></div>
```
In CSS, provide a size to your container Element. Also, set `img` elements to 100% height/width to ensure they fill the container.

```css
#containerElement { /* set Ad size */
  height: 300px;
  width: 250px;
}
img {               /* set img elements to be responsive */
  height: 100%;
  width: 100%;
  /* [optional] To stretch image to fit container */
  /* object-fit: cover; */
}
```
Using the above styles, the displayed Ads will have a height of `300px` and width of `250px`. **Ad sizes are completely controlled by the user**. You are free to use media queries to further tweak the dimensions.
See [common sizes for responsive Ads](https://support.google.com/google-ads/answer/7031480?hl=en) to see Ad-dimensions that suit your needs.

In JS, create an `Array` with the advertisements to be displayed.

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
const instance = rotator(
  document.getElementById('containerElement'),
  items
);
// start the rotation
instance.start();
```
That's it! You should now have Ad-rotation in action! The library sets sensible defaults on initialization. For example, Ads are rotated in a random fashion by default. You can provide a 3rd *optional* configuration parameter to override this and fine tune the settings of your adrotator. See **[`configuration options`](#configurationoptions)** for available variations.


_**_NOTE:_**_ By default, `adRotator` is designed to **fail silently** for any configuration error. This means that it will neither pollute the DOM nor will it attach any events in case of an error. It only logs a console error to help you diagnose any configuration error.

## 🎨 Styling (css)

In addition to the styling required for setting the dimensions of an Ad-unit, it is **strongly recommended** that you include the following base styles, however this is not mandatory. (**Note**: You may have included them already if you followed the steps in the [install](#installLink) section)

```css
.fadeIn { /* adds animation during Ad-rotation */
  -webkit-animation: fadeIn 200ms ease-in-out;
  animation: fadeIn 200ms ease-in-out;
}
@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
}
/*
 * If you use sticky Ads: Add a smooth transition, z-index
 */
.stickyElx {
  transition: all 0.5s;
  z-index: 1;
}
```

These styles are optional and can be omitted or can be easily overriden as needed.

---

## <a id="configurationoptions">⚙️ Configuration Options</a>

Ad-rotator accepts the following configuration options and all of them are **Optional**.

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `timer? : number` | The time after which an advertisement will be rotated in seconds. Lowest accepted value is 2s | `5` (_seconds_)|
| `target? : string` | The target device. Can be set to `desktop`, `mobile` or `all`. When set to desktop, ads will be shown only on a desktop device whereas when set to mobile, ads will be displayed on a mobile device alone. By default, ads are shown on all devices. | `"all"` |
| `cb?: (unit: AdUnit, El: HTMLElement, conf: AdConfig)` | A **callback** that is executed on every image rotation. The callback receives 3 parameters `cb(currentAdUnit, parentElement, configParams)`. This callback can be used for analytics, to programmatically control the rotator instance or for any other purpose. | `undefined` |
| `onHover?: (item: AdUnit, El: HTMLElement)` | A **callback** that is executed on hovering over an Ad unit. The callback receives 2 parameters `cb(currentAdUnit, parentElement)`. | `undefined` |
| `onClick?: (e: MouseEvent, unit: AdUnit)` | A **callback** that is executed on clicking an Ad unit. The callback receives 2 parameters `(event, currentAdUnit)` | `undefined` |
| `imgClass? : string` | Class that should be added to the image Tag | `""`|
| `linkClass? : string` | Class that should be added to the link Tag | `""`|
| `random? : boolean` | The advertisements are rotated in a random fashion by default. Set to `false` to have them rotated sequentially | `true`|
| `newTab? : boolean` |  Set to `true` to open the advertisement URL in a new Tab | `false`|
| `fallbackMode? : boolean` |  Sets the working mode of the library. When set to `true`, the library is used **only** if it detects an Adblocker, otherwise it does absolutely nothing i.e. it neither pollutes the DOM nor attaches any events | `false`|
| `sticky? : {}` | Allows sticky Ads. By default, Ads shown are not sticky. To enable sticky Ads, pass an empty object `sticky: {}`. You can customize sticky Ads by providing the following properties - | `undefined`|

```javascript
sticky: {
    beforeEl: document.querySelector('.start'),
    afterEl: document.querySelector('.end'),
    position: 'sticky',     // or 'fixed' (defaults to 'fixed')
    offsetTop: '10',        // or '10px' (defaults to 0px)
    offsetBottom: '150px',  // or '150'  (defaults to 0px)
    noMobile: true          // disable stickiness on mobile (defaults to false)
}
// beforeEl => Element after which the Ad becomes sticky
// afterEl => Element before which Ad stops being sticky
```
A css class **`stickyElx`** is added dynamically to the sticky Element's container to allow further customization such as modifying css properties (like z-index), using media queries and so on.

---

### 💡 Note
It is possible to change configuration options after instantiation.
```javascript
// init adRotator with default options
const instance = rotator( /* options */ )
// update config after instantiation to change to sequential rotation
instance.conf.random = false;
```

---


## 💠 API

* [`adRotator.start()`](#adrotatorstart)
* [`adRotator.pause()`](#adrotatorpause)
* [`adRotator.resume()`](#adrotatorresume)
* [`adRotator.add()`](#adrotatoradd)
* [`adRotator.remove()`](#adrotatorremove)
* [`adRotator.destroy()`](#adrotatordestroy)


#### <a id="adrotatorstart">🔸 adRotator.`start()`</a>

Starts the Ad-Rotation

```javascript
const instance = rotator(
    document.getElementById('containerElement'),
    [
        { url: 'https://gospelmusic.io#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
        { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
    ],
    { target: 'mobile' }  // configuration options
);
instance.start();         // starts the rotation
```

#### <a id="adrotatorpause">🔸 adRotator.`pause()`</a>

Pauses the Rotation. However, if the user clicks/hovers the Ad or scrolls away from the Ad such that it is not visible anymore & then scrolls back to it, rotation will resume automatically. Rotation cannot be paused permanently because that would beat the purpose of this library.
```javascript
const instance = rotator( /* options */ )
instance.pause();                  // pauses the rotation

/* You can also use "pause" in the cb(callback) config option to
 * pause every advertisement after it has been clicked/hovered upon
 */
instance.conf.cb = instance.pause;
```
See [cb(callback) config option](#configurationoptions) for further details on its usage.

To resume the rotation, simply call `adRotatorInstance.resume()`

#### <a id="adrotatorresume">🔸 adRotator.`resume()`</a>

Resumes the Rotation.
```javascript
const instance = rotator( /* options */ )
instance.pause();
instance.resume();        // resumes the rotation
```
Use `adRotatorInstance.resume()` to resume a paused rotation.


#### <a id="adrotatoradd">adRotator.`add()`</a>

Inject a new Advertisement into the adRotator.
```javascript
const instance = rotator( /* options */ )
instance.add(
  {
    url: 'https://gospelmusic.io',
    img: './path-to-img'
  }
);
```
The newly injected Advertisement will be displayed in the next rotation cycle

#### <a id="adrotatorremove">🔸 adRotator.`remove()`</a>

Remove an item from the Advertisements array.
```javascript
const instance = rotator( /* options */ )
instance.remove(); // remove the last item
instance.remove(   // remove a specific item
  {
    url: 'https://digitalfortress.tech', // url is optional
    img: './path-to-img'
  }
);
```
The `remove()` method deletes the last item in the advertisements array. To remove a particular advertisement, you can also pass it a parameter (**`rotatorInstance.remove({ img: 'xyz.gif'})`**). The change in the Advertisements array will be reflected in the next rotation cycle

#### <a id="adrotatordestroy">🔸 adRotator.`destroy()`</a>

Destroys Ad Rotation. Cleans up the DOM and removes all associated events.

```javascript
const instance = rotator( /* options */ )
instance.destroy();        // destroys the rotation, DOM and events
```
To reactivate adRotator, simply call `adRotatorInstance.start()`


### 🧑‍💻 Contribute

Interested in contributing features and fixes?

[Read more on contributing](./contributing.md).

### 📝 Changelog

See the [Changelog](https://github.com/niketpathak/adRotator/wiki/Changelog)

### 📄 License

[MIT](LICENSE) © [DigitalFortress](https://digitalfortress.tech)