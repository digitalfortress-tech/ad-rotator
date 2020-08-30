import "./style.less";

/**
 * Minimum screen width to consider as desktop
 * @type {number}
 */
const desktopWidth = 992;
/**
 * Detected device
 * @type {string}
 */
const device = window.screen.availWidth >= desktopWidth ? "desktop" : "mobile";
/**
 * A no-operation function
 * @type {function () {}}
 */
const noop = () => {};

/**
 * DefaultConfig
 * @param shape
 * @return {{timer: number, random: boolean, shape: string, objectFit: string, width: number, sticky: null, imgClass: string, linkClass: string, height: number, target: string}}
 */
function getDefaultConfig(El, shape = "square") {
  let config = {
    shape: "square",
    height: 300,
    width: 250,
    imgClass: "",
    linkClass: "",
    objectFit: "inherit",
    sticky: null,
    target: "all",
    timer: 5000,
    random: true,
    newTab: false,
    cb: null,
    debug: false
  };
  switch(shape.toLowerCase()) {
  case "leaderboard":
    config.height = 90;
    config.width = 728;
    break;
  case "sidebar":
    config.height = 600;
    config.width = 300;
    break;
  case "mobile":
    config.width = El.clientWidth; // window.screen.availWidth;
    config.height = 90;
    config.target = "mobile";
    break;
  default:
    break;
  }

  return config;
}

function stickyEl(El, conf) {
  if (!El || !conf || !(El instanceof HTMLElement) || !(conf instanceof Object)) return 0;

  let {beforeEl, afterEl, offsetTop, offsetBottom} = conf.sticky;
  let startPos = 0, endPos = 0, scrollPos = 0;
  let ticking = false;
  if (beforeEl && beforeEl instanceof HTMLElement) {
    const props = beforeEl.getBoundingClientRect();
    startPos = window.pageYOffset + props.top + props.height;
  }
  if (afterEl && afterEl instanceof HTMLElement) {
    endPos = window.pageYOffset + afterEl.getBoundingClientRect().top;
  }

  const eventHandler = () => {
    if (!ticking) {
      scrollPos = window.scrollY;
      window.requestAnimationFrame(() => {
        if (scrollPos > startPos) {
          El.classList.add("stickyElx");
          El.style.position = "fixed";
          El.style.top = ((parseInt(offsetTop, 10)) || 0) + "px";
        } else {
          El.style.top = 0;
          El.style.position = "relative";
          El.classList.remove("stickyElx");
        }
        if (endPos && scrollPos > (endPos - conf.height - (parseInt(offsetBottom, 10) || 0))) {
          El.style.top = 0;
          El.style.position = "relative";
          El.classList.remove("stickyElx");
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", eventHandler);
  return eventHandler;
}

function rotateImage(El, units, conf, unitsClone, prevItem = {})  {
  let unit;
  if (conf.random) {                                                                                // get random unit
    let index = unitsClone.length === 1 ? 0 : Math.floor(Math.random() * unitsClone.length );
    while (unitsClone.length > 1 && prevItem.img === unitsClone[index].img) {                       // ensure randomness at the end of array
      index = Math.floor(Math.random() * unitsClone.length );
    }
    unit = unitsClone[index];
    if (unitsClone.length !== 1) {
      unitsClone.splice(index, 1);                                                                  // remove item from arr
    } else {
      unitsClone = JSON.parse(JSON.stringify(units));
    }
  } else {                                                                                          // sequential
    unit = unitsClone.shift();
    if (!unitsClone.length) unitsClone = JSON.parse(JSON.stringify(units));                         // reset clone when array length is reached
  }

  // create link
  let link = document.createElement("a");
  link.href = unit.url || "";
  link.setAttribute("rel", "noopener nofollow noreferrer");
  conf.linkClass && link.classList.add(conf.linkClass);
  conf.newTab && link.setAttribute("target", "_blank");
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

  // exec callback
  try {
    (conf.cb || noop)(unit, El, conf);
  } catch (e) {
    conf.debug && console.error("Callback Error", conf.cb, e);
  }

  return {
    unitsClone,
    prevItem: unit
  };
}

export default function (El, units = [], options = {}) {
  let initErr = false;
  const conf = Object.assign({}, getDefaultConfig(El, options.shape || ""), options);
  if (!El || !(El instanceof HTMLElement) || !units || !(units instanceof Array) || !units.length || !(units[0] instanceof Object) || !units[0].url || !units[0].img
          || isNaN(conf.timer) || isNaN(conf.height) || isNaN(conf.width)
  ) {
    conf.debug && console.error("Missing/malformed parameters - El, Units, Config", El, units, conf);
    initErr = true;
  }

  let inter;                // reference to interval
  let ret;                  // reference to return value of `rotateImage`
  let prevItem = null;
  let unitsClone = JSON.parse(JSON.stringify(units));    // clone units

  // Manage events
  const eventManager = {
    scrollEvRef: null,
    obs: null,
    init() {
      this.destroy();
      El.addEventListener("mouseover", () => {
        out.pause();
      });

      El.addEventListener("mouseout", () => {
        out.resume();
      });
      // add observer
      this.obs = new IntersectionObserver(this.obsCb.bind(out), {threshold: 0.5});
      this.obs.observe(El);
      // make sticky
      if (conf.sticky && typeof conf.sticky === "object") { this.scrollEvRef = stickyEl(El, conf); }
    },
    destroy() {
      const clone = El.cloneNode(true);
      El.parentNode.replaceChild(clone, El);
      El = clone;
      if (this.scrollEvRef)  window.removeEventListener("scroll", this.scrollEvRef);
      if (this.obs) this.obs.unobserve(El);
    },
    obsCb(entries) {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= 0.5) {
          this.resume();
        } else {
          this.pause();
        }
      });
    },
  };

  // prepare output
  const out = {
    conf,
    pause() {
      if (inter) { clearInterval(inter);}
    },
    start() {
      if (initErr) return;
      if (conf.target === "mobile" && device !== "mobile"
        || conf.target === "desktop" && device !== "desktop"  
      ) return;
      eventManager.init();
      ret = rotateImage(El, units, conf, unitsClone);
      unitsClone = ret.unitsClone;
      prevItem = ret.prevItem;
      // this.resume(); // deprecated
    },
    resume() {
      if (initErr) return;
      this.pause();
      // rotate only if multiple units are present
      if (units.length > 1)
        inter = window.setInterval(function () {
          ret = rotateImage(El, units, conf, unitsClone, prevItem);
          unitsClone = ret.unitsClone;
          prevItem = ret.prevItem;
        }, conf.timer);
    },
    destroy() {
      if (initErr) return;
      this.pause();
      while(El.firstChild) { El.firstChild.remove();}
      eventManager.destroy();
    },
    add(item) {
      if (initErr) return;
      if (item && (item instanceof Object) && item.url && item.img) {
        units.push(item);
      }
    },
    remove(ob) {
      if (initErr) return;
      if (!ob) units.pop();
      else units = units.filter(item => item.img !== ob.img);
      if (units.length <= 1) this.pause();
    }
  };

  return out;
}
