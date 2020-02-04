import "./style.less";

/**
 * Minimum screen width to consider as desktop
 * @type {number}
 */
const desktopWidth = 992;
/**
 * Iteration within the array
 * @type {number}
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
 * @return {{timer: number, random: boolean, static: boolean, debug: boolean, shape: string, objectFit: string, width: number, sticky: null, imgClass: string, linkClass: string, height: number}}
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
  let {beforeEl, afterEl, offsetTop, offsetBottom} = conf.sticky;
  let startPos = 0, endPos = 0, scrollPos = 0;
  let ticking = false;
  if (beforeEl && beforeEl instanceof HTMLElement) {
    startPos = beforeEl.offsetTop;
  }
  if (afterEl && afterEl instanceof HTMLElement) {
    endPos = afterEl.offsetTop;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      scrollPos = window.scrollY;
      window.requestAnimationFrame(() => {
        if (scrollPos > startPos) {
          El.style.position = "fixed";
          El.style.top = parseInt(offsetTop, 10) || 30 + "px";
        } else {
          El.style.position = "relative";
        }
        if (endPos && scrollPos > (endPos - conf.height - (parseInt(offsetBottom, 10) || 0))) {
          El.style.position = "relative";
        }
        ticking = false;
      });
      ticking = true;
    }
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
    unit = items_immutable[iter];
    iter++;
    if (items_immutable.length <= iter) iter = 0;           // reset iterator when array length is reached
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
}

export default function (El, units = [], options = {}) {
  const conf = Object.assign({}, getDefaultConfig(options.shape || ""), options);
  if (!El || !(El instanceof HTMLElement) || !units || !(units instanceof Array) || !units.length || !(units[0] instanceof Object) || !units[0].url || !units[0].img
          || isNaN(conf.timer) || isNaN(conf.height) || isNaN(conf.width)
  ) {
    conf.debug && console.error("Missing/malformed parameters - El, Units, Config", El, units, conf);
    return 0;
  }

  let inter;
  items = units;
  items_immutable = JSON.parse(JSON.stringify(units));
  rotateImage(El, conf);
  if (conf.sticky && window.screen.availWidth >= desktopWidth && typeof conf.sticky === "object") { stickyPub(El, conf); }

  // rotate images only if not static
  if (!conf.static) inter = window.setInterval(rotateImage, conf.timer, El, conf);

  return {
    pause() {
      if (inter) { clearInterval(inter);}
    },
    start() {
      this.pause();
      if (!conf.static) inter = window.setInterval(rotateImage, conf.timer, El, conf);
    },
    destroy() {
      this.pause();
      while(El.firstChild) { El.firstChild.remove();}
    },
    add(item) {
      if (item && (item instanceof Object) && item.url && item.img) {
        items_immutable.push(item);
      }
    }
  };
}
