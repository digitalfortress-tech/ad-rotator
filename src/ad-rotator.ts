import type { AdConfig, StickyConfig, AdUnit, EventManager, AdRotatorInstance } from './types';
import { NOOP, delay } from './helpers';
import './style.less';

// init constants
const mobile = 'mobile';
const desktop = 'desktop';

// Detected device ( 992 => min width to consider as desktop)
const device = window?.screen.availWidth >= 992 ? desktop : mobile;
// default Rotation Time
const interval = 5; // 5 seconds

let hasBlk: boolean; // flag to detect AdBlockers
let blkProbe: Promise<boolean> | undefined; // memoized in-flight detection

/**
 * Default configuration (frozen to prevent cross-instance mutation)
 */
const DEFAULT_CONFIG = Object.freeze({
  target: 'all',
  timer: interval,
  random: true,
  newTab: false,
  fallbackMode: false,
}) as AdConfig;

/** Sanitize URLs to prevent XSS via dangerous protocols */
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(?:javascript|vbscript):/i.test(trimmed)) return '';
  return trimmed;
};

const detectBlock = (): Promise<boolean> => {
  if (hasBlk !== undefined) return Promise.resolve(hasBlk);
  // memoize the in-flight probe so concurrent start() calls share one run
  if (blkProbe) return blkProbe;

  blkProbe = (async (): Promise<boolean> => {
    // test with baitElement
    const testDiv = document.createElement('div');
    testDiv.className = window.atob(
      'YjNFbCBhZHMgYWQgYWRzYm94IGRvdWJsZWNsaWNrIGFkLXBsYWNlbWVudCBjYXJib24tYWRzIHByZWJpZCBhZC11bml0'
    );

    document.body.appendChild(testDiv);
    const isHidden = getComputedStyle(testDiv).display === 'none';
    testDiv.remove();

    if (isHidden) return (hasBlk = true);

    // fallback to pinging a real ad network
    try {
      await fetch(window.atob('aHR0cHM6Ly9wYWdlYWQyLmdvb2dsZXN5bmRpY2F0aW9uLmNvbS9wYWdlYWQvanMvYWRzYnlnb29nbGUuanM='), {
        method: 'HEAD',
        mode: 'no-cors',
      });
    } catch (_e) {
      return (hasBlk = true);
    }

    return (hasBlk = false);
  })();

  return blkProbe;
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

  window.addEventListener('scroll', eventHandler, { passive: true });
  return eventHandler;
};

/**
 * Generates a random number by weight
 * @param units Array of AdUnits
 * @returns
 */
const randomNum = (units: AdUnit[]): number => {
  let totalWeight = 0;
  for (let i = 0, len = units.length; i < len; i++) {
    totalWeight += units[i].weight || 1;
  }
  let r = Math.random() * totalWeight;
  for (let i = 0, len = units.length; i < len; i++) {
    r -= units[i].weight || 1;
    if (r <= 0) return i;
  }
  return units.length - 1;
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
    // ensure randomness at the end of a complete rotation cycle.
    // cap retries so duplicate `img` values across units can't spin forever.
    let attempts = 0;
    while (unitsClone.length > 1 && prevItem.img === unitsClone[index].img && attempts++ < unitsClone.length) {
      index = randomNum(unitsClone);
    }
    unit = unitsClone[index];
    if (unitsClone.length !== 1) {
      unitsClone.splice(index, 1); // remove item from arr
    } else {
      unitsClone = [...units];
    }
  } else {
    // sequential
    unit = unitsClone.shift();
    if (!unitsClone.length) unitsClone = [...units]; // reset clone when array length is reached
  }

  // create link
  const link = document.createElement('a');
  link.href = sanitizeUrl((unit as AdUnit).url);
  link.setAttribute('rel', 'noopener nofollow noreferrer');
  if (conf.linkClass) link.classList.add(conf.linkClass);
  if (conf.newTab) link.setAttribute('target', '_blank');
  // add onclick handler
  link.addEventListener('click', (e) => {
    (conf.onClick || NOOP)(e, unit as AdUnit);
  });
  // create image
  const img = document.createElement('img');
  img.src = (unit as AdUnit).img;
  img.classList.add('fadeIn');
  if (conf.imgClass) img.classList.add(conf.imgClass);

  if ((unit as AdUnit).title) {
    // improve accessibility, SEO
    link.setAttribute('title', `${(unit as AdUnit).title}`);
    link.setAttribute('aria-label', `${(unit as AdUnit).title}`);
    img.setAttribute('alt', `${(unit as AdUnit).title}`);
  } else {
    img.setAttribute('alt', ''); // decorative image: empty alt for accessibility
  }

  // allow time to preload images
  await delay(900);

  // attach an image to the link
  link.appendChild(img);
  // clean Src element and remove all listeners
  while (El.firstChild) El.firstChild.remove();
  // add the link to the El
  El.appendChild(link);

  // exec callback on every rotation
  (conf.cb || NOOP)(unit as AdUnit, El, conf);

  return {
    unitsClone,
    prevItem: unit,
  };
};

export const init = (El: HTMLElement, units: AdUnit[] = [], options: AdConfig = {}): AdRotatorInstance => {
  const conf = { ...DEFAULT_CONFIG, ...options };
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
    // eslint-disable-next-line no-console
    console.error('Missing/malformed params - El, Units, Config', El, units, conf);
    // fail silently: return an inert instance whose methods are all no-ops
    return { conf, start: NOOP, pause: NOOP, resume: NOOP, destroy: NOOP, add: NOOP, remove: NOOP };
  }

  let inter: number | undefined; // reference to interval
  let ret: Awaited<ReturnType<typeof rotateImage>>; // reference to return value of `rotateImage`
  let prevItem: AdUnit | null = null;
  // runtime bypass flag, used only by fallbackMode to disable the API
  // when no ad-blocker is detected (init-time validation now returns early)
  let hasErr = false;

  // (re)sort units by weight (highest first) and rebuild the working clone
  const resetUnits = () => {
    units.sort((a, b) => +(b.weight || 1) - +(a.weight || 1));
    unitsClone = [...units];
  };

  let unitsClone: AdUnit[] = [];
  resetUnits();

  // named handler refs so listeners can be removed cleanly (no node-clone hack)
  let onMouseEnter: (() => void) | null = null;
  let onMouseLeave: (() => void) | null = null;

  // Manage events
  const eventManager: EventManager = {
    scrollEvRef: null,
    obs: null,
    init() {
      this.destroy();
      onMouseEnter = () => {
        out.pause();
        // on hover callback
        (conf.onHover || NOOP)(prevItem, El);
      };
      onMouseLeave = () => {
        out.resume();
      };
      El.addEventListener('mouseenter', onMouseEnter);
      El.addEventListener('mouseleave', onMouseLeave);
      // add observer
      this.obs = new IntersectionObserver(this.obsCb.bind(out), { threshold: 0.5 });
      this.obs.observe(El);
      // make sticky
      if (conf.sticky && conf.sticky.constructor === Object && (!conf.sticky.noMobile || device !== mobile)) {
        this.scrollEvRef = stickyEl(El, conf.sticky);
      }
    },
    destroy() {
      // fully tear down the observer and listeners; keeps El identity stable
      if (this.obs) {
        this.obs.disconnect();
        this.obs = null;
      }
      if (onMouseEnter) El.removeEventListener('mouseenter', onMouseEnter);
      if (onMouseLeave) El.removeEventListener('mouseleave', onMouseLeave);
      onMouseEnter = onMouseLeave = null;
      // remove stickiness
      if (this.scrollEvRef) {
        window.removeEventListener('scroll', this.scrollEvRef as (this: Window, event: Event) => void);
        this.scrollEvRef = null;
        El.classList.remove('stickyElx');
        if (El.style.position === 'fixed') El.style.position = 'relative';
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
      if (inter !== undefined) {
        clearInterval(inter);
        inter = undefined;
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
        inter = window.setInterval(
          async function () {
            ret = await rotateImage(El, units, conf, unitsClone, prevItem as AdUnit);
            unitsClone = ret.unitsClone;
            prevItem = ret.prevItem as AdUnit;
          },
          (rotationTime as number) * 1e3 - 900
        );
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
        // keep weight order and the working clone in sync with `units`
        resetUnits();
      }
    },
    remove(item: AdUnit) {
      if (hasErr) return;
      if (units.length <= 1) return this.pause();

      if (!item) units.pop();
      else units = units.filter((i) => i.img !== item.img);
      // keep weight order and the working clone in sync with `units`
      resetUnits();
    },
  };

  return out;
};
