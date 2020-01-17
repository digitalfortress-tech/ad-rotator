import './style.less'

/*
 Iteration within the array
 */
let iter = 0;
/*
Each avert item
 */
let items = [];
let items_immutable = [];

/**
 * DefaultConfig
 * @param shape
 * @returns {{padding: number, margin: number, shape: string, sticky: boolean, width: number, height: number}}
 */
function getDefaultConfig(shape = 'square') {
  let config = {
    shape: 'square',
    height: 300,
    width: 250,
    padding: 0,
    margin: 0,
    sticky: false,
    timer: 10000,
    random: true,
    debug: false
  };
  if (shape === 'leaderboard') {
    config.height = 90;
    config.width = 728;
  } else if (shape === 'sidebar') {
    config.height = 600;
    config.width = 300;
  }
  return  config;
}

function rotateImage(El, conf) {
  let unit;
  if (conf.random) {                                        // get random unit
    const index = items.length === 1 ? 0 : Math.floor(Math.random() * (items.length - 1 + 1));
    unit = items[index];
    if (items.length !== 1) {
      items.splice(index, 1);                               // remove item from arr
    } else {
      items = JSON.parse(JSON.stringify(items_immutable));
    }

  } else {                                                  // sequential
    unit = items[iter];
    iter++;
    if (items.length - 1 <= iter) iter = 0;                 // reset iterator when array length is reached
  }
  // console.debug('***rotateImg', unit, items, conf, iter, items_immutable);
  let img = new Image(conf.height, conf.width);
  img.src = unit.img;
  img.classList.add('fadeIn');
  El.childNodes[0] ? El.replaceChild(img, El.childNodes[0]) : El.appendChild(img);
}

export default function (htmlEl, units = [], options = {}) {
  const conf = Object.assign({}, getDefaultConfig(), options);
  if (!htmlEl || !htmlEl instanceof HTMLElement || !units || !units instanceof Array || !units.length || !units[0] instanceof Object || !units[0].url || !units[0].img) {
    conf.debug && console.error('Missing/malformed parameters. Html El, Ad Units', htmlEl, units);
    return false;
  }
  items = units;
  items_immutable = JSON.parse(JSON.stringify(units));
  rotateImage(htmlEl, conf);
  window.setInterval(rotateImage, conf.timer, htmlEl, conf);

  // console.debug('***htmlEl', htmlEl, htmlEl instanceof HTMLElement);

  return true;
}


// @todo: add support for inline encoded images too