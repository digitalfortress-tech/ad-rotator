import "./style.less";

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
 * @return {{timer: number, random: boolean, static: boolean, debug: boolean, shape: string, width: number, sticky: boolean, imgClass: string, linkClass: string, height: number}}
 */
function getDefaultConfig(shape = "square") {
  let config = {
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
  };
  if (shape.toLowerCase() === "leaderboard") {
    config.height = 90;
    config.width = 728;
  } else if (shape.toLowerCase() === "sidebar") {
    config.height = 600;
    config.width = 300;
  }
  return config;
}

function stickyPub(El, conf) {
  // console.debug("***sticky", El, conf);
  let {beforeEl, afterEl, topOffset} = conf.sticky;
  let startPos = 0, endPos = 0, scrollPos = 0;
  let ticking = false;
  if (beforeEl && beforeEl instanceof HTMLElement) {
    startPos = beforeEl.offsetTop;
  }
  if (afterEl && afterEl instanceof HTMLElement) {
    endPos = afterEl.offsetTop;
  }
  // console.debug("***startPos, endPos, topOffset", startPos, endPos, topOffset);

  window.addEventListener("scroll", () => {
    scrollPos = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (scrollPos > startPos) {
          El.style.position = "fixed";
          El.style.top = parseInt(topOffset, 10) || 30 + "px";
        } else {
          El.style.position = "relative";
        }
        if (endPos && scrollPos > (endPos - conf.height)) {
          El.style.position = "relative";
        }

        ticking = false;
      });

      ticking = true;
    }
    // console.debug("***scrollPOS", scrollPos);
    // @todo: take into account computedStyles to account for top margin/padding
  });
}

function rotateImage(El, conf) {
  let unit;
  if (conf.random) {                                        // get random unit
    const index = items.length === 1 ? 0 : Math.floor(Math.random() * items.length );
    unit = items[index];
    if (items.length !== 1) {
      items.splice(index, 1);                               // remove item from arr
    } else {
      items = JSON.parse(JSON.stringify(items_immutable));
    }
  } else {                                                  // sequential
    unit = items[iter];
    iter++;
    if (items.length <= iter) iter = 0;                     // reset iterator when array length is reached
  }

  // create link
  let link = document.createElement("a");
  link.href = unit.url || "";
  link.setAttribute("rel", "noopener nofollow noreferrer");
  conf.linkClass && link.classList.add(conf.linkClass);
  // create image
  let img = new Image(conf.width, conf.height);
  img.src = unit.img;
  img.classList.add("fadeIn");
  conf.imgClass && img.classList.add(conf.imgClass);
  img.style.objectFit = conf.objectFit;
  // attach an image to the link
  link.appendChild(img);
  // add the link to the El
  El.childNodes[0] ? El.replaceChild(link, El.childNodes[0]) : El.appendChild(link);

  // console.debug('***rotateImg', unit, items, conf, iter, items_immutable);
}

export default function (El, units = [], options = {}) {
  const conf = Object.assign({}, getDefaultConfig(options.shape || ""), options);
  if (!El || !(El instanceof HTMLElement) || !units || !(units instanceof Array) || !units.length || !(units[0] instanceof Object) || !units[0].url || !units[0].img) {
    conf.debug && console.error("Missing/malformed parameters. Element, Ad Units -", El, units);
    return;
  }
  // verify expected props values
  if (isNaN(conf.timer) || isNaN(conf.height) || isNaN(conf.width)) {
    conf.debug && console.error("Config Error", conf);
    return;
  }

  items = units;
  items_immutable = JSON.parse(JSON.stringify(units));
  rotateImage(El, conf);
  if (conf.sticky && typeof conf.sticky === "object") { stickyPub(El, conf); }
  if (conf.static) return  true;

  window.setInterval(rotateImage, conf.timer, El, conf);

  // console.debug('***HtmlEl', El, El instanceof HTMLElement);

  return true;
}
