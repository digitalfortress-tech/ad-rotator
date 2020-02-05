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

function rotateImage(El, units, conf, tempUnits, prevItem = {}) {
  let unit;
  if (conf.random) {                                                  // get random unit
    let index = tempUnits.length === 1 ? 0 : Math.floor(Math.random() * tempUnits.length );
    while (tempUnits.length > 1 && prevItem.img === tempUnits[index].img) {   // ensure randomness at the end of array
      index = Math.floor(Math.random() * tempUnits.length );
    }
    unit = tempUnits[index];
    if (tempUnits.length !== 1) {
      tempUnits.splice(index, 1);                                         // remove item from arr
    } else {
      tempUnits = JSON.parse(JSON.stringify(units));
    }
  } else {                                                            // sequential
    unit = units[iter];
    iter++;
    if (units.length <= iter) iter = 0;                               // reset iterator when array length is reached
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

  return {
    tempUnits,
    prevItem: unit
  };
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
  let prevItem = null;
  let tempUnits = JSON.parse(JSON.stringify(units));    // clone units
  if (units.length === 1) conf.static = true;

  // make sticky
  if (conf.sticky && window.screen.availWidth >= desktopWidth && typeof conf.sticky === "object") { stickyPub(El, conf); }

  return {
    pause() {
      if (inter) { clearInterval(inter);}
    },
    start() {
      this.pause();
      let res = rotateImage(El, units, conf, tempUnits);
      tempUnits = res.tempUnits;
      prevItem = res.prevItem;
      // rotate images only if not static
      if (!conf.static)
        inter = window.setInterval(function () {
          res = rotateImage(El, units, conf, tempUnits, prevItem);
          tempUnits = res.tempUnits;
          prevItem = res.prevItem;
        }, conf.timer);
    },
    destroy() {
      this.pause();
      while(El.firstChild) { El.firstChild.remove();}
    },
    add(item) {
      if (item && (item instanceof Object) && item.url && item.img) {
        units.push(item);
      }
    }
  };
}
