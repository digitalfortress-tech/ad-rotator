import type { AdConfig, StickyConfig, AdUnit, EventManager, AdRotatorInstance } from './types';
import { NOOP, delay } from './helpers';
import './style.less';

// init constants
const mobile = 'mobile';
const desktop = 'desktop';

// Detected device ( 992 => min width to consider as desktop)
const device = window.screen.availWidth >= 992 ? desktop : mobile;
// default Rotation Time
const interval = 5; // 5 seconds

let hasBlk: boolean; // flag to detect AdBlockers

/**
 * DefaultConfig
 */
const getDefaultConfig = {
  target: 'all',
  timer: interval,
  random: true,
  newTab: false,
  fallbackMode: false,
} as AdConfig;

const detectBlock = async () => {
  if (hasBlk !== undefined) {
    return hasBlk;
  }

  // test with baitElement
  const testDiv = document.createElement('div');
  testDiv.className = window.atob(
    'YjNFbCBhZHMgYWQgYWRzYm94IGRvdWJsZWNsaWNrIGFkLXBsYWNlbWVudCBjYXJib24tYWRzIHByZWJpZCBhZC11bml0'
  );

  document.body.appendChild(testDiv);
  if (getComputedStyle(testDiv)['display'] == 'none') {
    return (hasBlk = true);
  }

  // fallback to pinging a real ad network
  try {
    await fetch(window.atob('aHR0cHM6Ly9wYWdlYWQyLmdvb2dsZXN5bmRpY2F0aW9uLmNvbS9wYWdlYWQvanMvYWRzYnlnb29nbGUuanM='), {
      method: 'HEAD',
      mode: 'no-cors',
    });
  } catch (e) {
    return (hasBlk = true);
  }

  hasBlk = false;
};

export const stickyEl = (El: HTMLElement, stickyConf: StickyConfig): null | (() => void) => {
  if (!El || !(El instanceof HTMLElement) || !stickyConf || stickyConf.constructor !== Object) return null;

  const { beforeEl, afterEl, offsetTop, offsetBottom, position } = stickyConf;
  const isStickyPos = position === 'sticky' ? 1 : 0;

  let startPos = 0,
    endPos = 0;
  let ticking = false;

  const eventHandler = () => {
    if (!ticking) {
      const scrollPos = window.scrollY;
      if (beforeEl && beforeEl instanceof HTMLElement) {
        const props = beforeEl.getBoundingClientRect();
        startPos = scrollPos + props.top + props.height;
      }
      if (afterEl && afterEl instanceof HTMLElement) {
        endPos = scrollPos + afterEl.getBoundingClientRect().top;
      }

      window.requestAnimationFrame(() => {
        if (
          scrollPos > startPos &&
          !(endPos && scrollPos > endPos - El.clientHeight - (parseInt(offsetBottom as string, 10) || 0))
        ) {
          El.classList.add('stickyElx');
          El.style.position = isStickyPos ? 'sticky' : 'fixed';
          El.style.top = (parseInt(offsetTop as string, 10) || 0) + 'px';
        } else {
          if (!isStickyPos) {
            // fixed positioning
            El.style.top = '0';
            El.style.position = 'relative';
          }
          El.classList.remove('stickyElx');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', eventHandler);
  return eventHandler;
};

/**
 * Generates a random number by weight
 * @param units Array of AdUnits
 * @returns
 */
const randomNum = (units: AdUnit[]): number => {
  const totalWeight = units.reduce((acc, item) => acc + (item.weight || 1), 0);

  // generate an array that has a percentage of each item
  let runningTotal = 0;
  const cumulativeWeight = units.map((val) => {
    const relativeWeight = (val.weight || 1) / totalWeight;
    const cw = relativeWeight + runningTotal;
    runningTotal += relativeWeight;
    return cw;
  });

  // generate random number and compare it to the closest array value
  const r = Math.random();
  let closestIndex = 0;
  for (let i = 0, len = cumulativeWeight.length; i < len; i++) {
    if (r <= cumulativeWeight[i]) {
      closestIndex = i;
      break;
    }
  }

  return closestIndex;
};

const rotateImage = async (
  El: HTMLElement,
  units: AdUnit[],
  conf: AdConfig,
  unitsClone: AdUnit[],
  prevItem: AdUnit = {} as AdUnit
) => {
  let unit: AdUnit | undefined;
  if (conf.random) {
    // get random unit
    let index = unitsClone.length === 1 ? 0 : randomNum(unitsClone);
    while (unitsClone.length > 1 && prevItem.img === unitsClone[index].img) {
      // ensure randomness at the end of a complete rotation cycle
      index = randomNum(unitsClone);
    }
    unit = unitsClone[index];
    if (unitsClone.length !== 1) {
      unitsClone.splice(index, 1); // remove item from arr
    } else {
      unitsClone = JSON.parse(JSON.stringify(units));
    }
  } else {
    // sequential
    unit = unitsClone.shift();
    if (!unitsClone.length) unitsClone = JSON.parse(JSON.stringify(units)); // reset clone when array length is reached
  }

  // create link
  const link = document.createElement('a');
  link.href = (unit as AdUnit).url || '';
  link.setAttribute('rel', 'noopener nofollow noreferrer');
  conf.linkClass && link.classList.add(conf.linkClass);
  conf.newTab && link.setAttribute('target', '_blank');
  // add onclick handler
  link.addEventListener('click', (e) => {
    (conf.onClick || NOOP)(e, unit as AdUnit);
  });
  // create image
  const img = document.createElement('img');
  img.src = (unit as AdUnit).img;
  img.classList.add('fadeIn');
  conf.imgClass && img.classList.add(conf.imgClass);

  if ((unit as AdUnit).title) {
    // improve accessibility, SEO
    link.setAttribute('title', `${(unit as AdUnit).title}`);
    link.setAttribute('aria-label', `${(unit as AdUnit).title}`);
    img.setAttribute('alt', `${(unit as AdUnit).title}`);
  }

  // allow time to preload images
  await delay(900);
  // attach an image to the link
  link.appendChild(img);
  // clean Src element and remove all listeners
  El.innerHTML = '';
  // add the link to the El
  El.appendChild(link);

  // exec callback on every rotation
  (conf.cb || NOOP)(unit as AdUnit, El, conf);

  // unitsClone.length === units.length && console.log(' **** End of rotation cycle **** ');

  return {
    unitsClone,
    prevItem: unit,
  };
};

export const init = (El: HTMLElement, units: AdUnit[] = [], options: AdConfig = {}): AdRotatorInstance => {
  let hasErr = false;
  const conf = { ...getDefaultConfig, ...options };
  if (
    !El ||
    !(El instanceof HTMLElement) ||
    !units ||
    !(units instanceof Array) ||
    !units.length ||
    !(units[0] instanceof Object) ||
    !units[0].url ||
    !units[0].img ||
    isNaN(conf.timer as number)
  ) {
    hasErr = true;
    console.error('Missing/malformed params - El, Units, Config', El, units, conf);
  }

  let inter: number | undefined; // reference to interval
  let ret; // reference to return value of `rotateImage`
  let prevItem: AdUnit | null = null;

  // sort by weight (naturally, highest weight first)
  units.sort((a, b) => +(b.weight || 1) - +(a.weight || 1));

  let unitsClone = JSON.parse(JSON.stringify(units)); // clone units

  // Manage events
  const eventManager: EventManager = {
    scrollEvRef: null,
    obs: null,
    init() {
      this.destroy();
      El.addEventListener('mouseenter', () => {
        out.pause();
        // on hover callback
        (conf.onHover || NOOP)(prevItem, El);
      });

      El.addEventListener('mouseleave', () => {
        out.resume();
      });
      // add observer
      this.obs = new IntersectionObserver(this.obsCb.bind(out), { threshold: 0.5 });
      this.obs.observe(El);
      // make sticky
      if (
        conf.sticky &&
        (conf.sticky as unknown as Record<string, unknown>).constructor === Object &&
        (!(conf.sticky as unknown as Record<string, unknown>).noMobile || device !== mobile)
      ) {
        this.scrollEvRef = stickyEl(El, conf.sticky as unknown as Record<string, unknown>);
      }
    },
    destroy() {
      if (this.obs) this.obs.unobserve(El);
      const clone = El.cloneNode(true);
      (El.parentNode as HTMLElement).replaceChild(clone, El);
      El = clone as HTMLElement;
      // remove stickiness
      if (!conf.sticky) {
        window.removeEventListener('scroll', this.scrollEvRef as (this: Window, event: Event) => void);
        this.scrollEvRef = null;
        El.classList.remove('stickyElx');
        El.style.position === 'fixed' && (El.style.position = 'relative');
      }
    },
    obsCb(entries) {
      entries.forEach((entry) => {
        if ((entry.intersectionRatio as number) >= 0.5) {
          out.resume();
        } else {
          out.pause();
        }
      });
    },
  };

  // prepare output
  const out: AdRotatorInstance = {
    conf,
    pause() {
      if (inter) {
        clearInterval(inter);
      }
    },
    async start() {
      if (conf.fallbackMode) {
        await detectBlock();
        if (hasBlk === false) {
          hasErr = true; // Force Error to bypass exposed API if intended usage is only as a fallback
        }
      }

      if (hasErr) return;
      if ((conf.target === mobile && device !== mobile) || (conf.target === desktop && device !== desktop)) return;
      eventManager.init();
      ret = await rotateImage(El, units, conf, unitsClone);
      unitsClone = ret.unitsClone;
      prevItem = ret.prevItem as AdUnit;
    },
    resume() {
      if (hasErr) return;
      this.pause();
      // rotate only if multiple units are present
      if (units.length > 1) {
        const rotationTime = (conf.timer as number) >= 2 ? conf.timer : interval;
        inter = window.setInterval(async function () {
          ret = await rotateImage(El, units, conf, unitsClone, prevItem as AdUnit);
          unitsClone = ret.unitsClone;
          prevItem = ret.prevItem as AdUnit;
        }, (rotationTime as number) * 1e3 - 900);
      }
    },
    destroy() {
      if (hasErr) return;
      this.pause();
      while (El.firstChild) {
        El.firstChild.remove();
      }
      eventManager.destroy();
    },
    add(item: AdUnit) {
      if (hasErr) return;
      if (item && item instanceof Object && item.url && item.img) {
        units.push(item);
      }
    },
    remove(item: AdUnit) {
      if (hasErr) return;
      if (units.length <= 1) return this.pause();

      if (!item) units.pop();
      else units = units.filter((i) => i.img !== item.img);
    },
  };

  return out;
};
