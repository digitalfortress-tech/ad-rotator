# Ad-rotator
A light-weight JS library to rotate advertisements.

###Install
Install using npm by using the following command -
```shell script
npm install ad-rotator
```
###

###Usage

**In the browser context,**
- Include the script file  `<script src="node_modules/adRotator/dist/ad-rotator.js"></script>` at the bottom of your page
- The library will be available as a global object at `window.adRotator`

**As a module,**
- Import the package directly `import * as adRotator from ad-rotator`
- Require the package `var adRotator = require("ad-rotator")`

#### Configuration

Ad-rotator.js requires 2 mandatory parameters to be setup. 
- [Mandatory] The Container element where the Ads should be displayed/rotated
- [Mandatory] The Advertisements
- [Optional] Ad-rotator.js also accepts a 3rd optional parameter that allows you to override default configuration values

An example is shown below -
```html
<head></head>
<body>
    <div id="placement1"></div>
    <script src="node_modules/adRotator/dist/ad-rotator.js"></script>
</body>
```
```javascript
// An array with the advertisements to display
let items = [
    { url: 'https://niketpathak.com#1', img: 'https://niketpathak.com/images/works/gkm_pic_sq.jpg'},
    { url: 'https://digitalfortress.tech#2', img: 'https://niketpathak.com/images/works/maestrobits_sq.jpg'}
];
// initialize adRotator
const rotator = new AdRotator(
  document.getElementById('placement1'),
  items
);
```

On executing the above, adRotator is instantiated with the default configuration parameters as shown below - 
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

###Description - 
1. **Shape** (default - `square`) - This is the expected shape of the Ad. It can also be set to `leaderboard` or `sidebar`. **Leaderboard** takes the standard horizontal size of advertisements (height - 90px, width - 728px) whereas **Sidebar** is used for advertisements in the sidebar with a standard size of (height - 600px, width - 300px) 
2. **Height** (default - `300`) - The height of the advertisement
3. **Width** (default - `250`) - The width of the advertisement
4. **imgClass** (default - `""`) - Class that should be added to the image Tag
5. **linkClass** (default - `""`) - Class that should be added to the link Tag
6. **objectFit**: (default - `inherit`) - The `object-fit` property that should be used for the image
7. **sticky**: (default - `null`) - By default, the advertisement shown is not sticky. You can make it sticky by providing a configuration object as shown
```javascript
// beforeEl -> Element before the advertisement
// afterEl  -> Element after the advertisement
sticky: {
    beforeEl: document.querySelector('.heading'),
    afterEl: document.querySelector('.summary'),
    offsetBottom: '150px',
    offsetTop: '10' // or 10px
}
```
8. Timer: (default - `10000` ms). The time after which an advertisement will be rotated
9. random: (default - `true`) The advertisements are rotated in a random fashion by default. Set to `false` to have them rotated sequentially
10. static: (default - `false`) Set to `true` if you wish to disable ad-Rotation
11. debug: (default - `false`) Set to `true` if you wish to see logging information