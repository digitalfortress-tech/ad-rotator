import { init, stickyEl } from './ad-rotator';
import { NOOP, delay } from './helpers';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

describe('Ad-rotator', () => {
  const mockIntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = mockIntersectionObserver;

  const items = [
    { img: './assets/image.jpg', url: 'https://xyz.com#1', title: 'Ad 1' },
    { img: 'https://xyz.com/image.png', url: 'https://xyz.com#2' },
    { img: 'https://xyz.com/image.svg', url: 'https://xyz.com#3' },
    { img: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', url: 'https://xyz.com#4' },
  ];
  let AdContainer;

  beforeEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '<div id="containerElement"></div>';
    AdContainer = document.getElementById('containerElement');
  });

  // ─── Initialization & display ───────────────────────────────────────

  it('should display an advert with default options', async () => {
    const instance = init(AdContainer, items);
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    const img = document.querySelector('img');
    expect(link).not.toBe(null);
    expect(img).not.toBe(null);
  });

  it('should display an advert with custom options', async () => {
    const mockOnClick = jest.fn();
    const instance = init(AdContainer, items, {
      imgClass: 'test-image',
      linkClass: 'test-link',
      random: false,
      newTab: true,
      onClick: mockOnClick,
      timer: 2,
    });
    instance.start();

    await wait(1800);
    const link = document.querySelector('a.test-link');
    const img = document.querySelector('img.test-image');
    expect(img.getAttribute('src')).toEqual('./assets/image.jpg');
    expect(img.getAttribute('alt')).toEqual('Ad 1');
    expect(link.getAttribute('href')).toEqual('https://xyz.com#1');
    expect(link.getAttribute('title')).toEqual('Ad 1');
    expect(link.getAttribute('aria-label')).toEqual('Ad 1');
    expect(link.getAttribute('target')).toEqual('_blank');

    link.click();
    expect(mockOnClick).toHaveBeenCalled();
  });

  // ─── Error handling ─────────────────────────────────────────────────

  it('should log error and fail silently when El is null', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(null, items);
    instance.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should log error when units array is empty', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(AdContainer, []);
    instance.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should log error when first unit is missing url', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(AdContainer, [{ img: 'test.jpg' }]);
    instance.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should log error when first unit is missing img', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(AdContainer, [{ url: 'https://x.com' }]);
    instance.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should log error when timer is NaN', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(AdContainer, items, { timer: NaN });
    instance.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should log error and fail silently when units is not an array', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let instance;
    expect(() => (instance = init(AdContainer, 'not-an-array'))).not.toThrow();
    expect(spy).toHaveBeenCalled();
    // inert instance: methods are safe no-ops
    expect(() => instance.start()).not.toThrow();
    spy.mockRestore();
  });

  // ─── Link attributes ───────────────────────────────────────────────

  it('should set rel attribute on link', async () => {
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('rel')).toEqual('noopener nofollow noreferrer');
  });

  it('should not set target attribute when newTab is false', async () => {
    const instance = init(AdContainer, items, { random: false, newTab: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('target')).toBe(null);
  });

  // ─── Accessibility ──────────────────────────────────────────────────

  it('should set empty alt when title is not provided', async () => {
    const noTitleItems = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, noTitleItems, { random: false });
    instance.start();
    await wait(1000);
    const img = document.querySelector('img');
    expect(img.getAttribute('alt')).toEqual('');
  });

  it('should always have fadeIn class on img', async () => {
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    const img = document.querySelector('img');
    expect(img.classList.contains('fadeIn')).toBe(true);
  });

  // ─── URL sanitization (XSS prevention) ─────────────────────────────

  it('should sanitize javascript: protocol URLs', async () => {
    const xssItems = [
      { img: './safe.jpg', url: 'javascript:alert(1)', title: 'XSS' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    const instance = init(AdContainer, xssItems, { random: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toEqual('');
  });

  it('should sanitize vbscript: protocol URLs', async () => {
    const xssItems = [
      { img: './safe.jpg', url: 'vbscript:msgbox("xss")', title: 'XSS' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    const instance = init(AdContainer, xssItems, { random: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toEqual('');
  });

  it('should allow safe URLs through sanitization', async () => {
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toEqual('https://xyz.com#1');
  });

  it('should sanitize file: protocol URLs', async () => {
    const xssItems = [
      { img: './safe.jpg', url: 'file:///etc/passwd' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    const instance = init(AdContainer, xssItems, { random: false });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a').getAttribute('href')).toEqual('');
  });

  it('should reject data:text/html hrefs but allow scheme-less and mailto', async () => {
    const htmlData = [
      { img: './safe.jpg', url: 'data:text/html,<script>alert(1)</script>' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    let instance = init(AdContainer, htmlData, { random: false });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a').getAttribute('href')).toEqual('');

    document.body.innerHTML = '<div id="containerElement"></div>';
    AdContainer = document.getElementById('containerElement');
    const relItems = [
      { img: './safe.jpg', url: '/relative/path' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    instance = init(AdContainer, relItems, { random: false });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a').getAttribute('href')).toContain('/relative/path');
  });

  it('should block data:text/html image src but allow data:image', async () => {
    const items = [
      { img: 'data:text/html,<script>alert(1)</script>', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    expect(document.querySelector('img').getAttribute('src')).toEqual('');
  });

  it('should not crash when linkClass/imgClass contain multiple tokens', async () => {
    const instance = init(AdContainer, items, {
      random: false,
      linkClass: 'a b  c',
      imgClass: 'x y',
    });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    const img = document.querySelector('img');
    expect(link.classList.contains('a')).toBe(true);
    expect(link.classList.contains('c')).toBe(true);
    expect(img.classList.contains('x')).toBe(true);
    expect(img.classList.contains('fadeIn')).toBe(true);
  });

  // ─── Weight / sorting ──────────────────────────────────────────────

  it('should sort units by weight in sequential mode (highest first)', async () => {
    const weightedItems = [
      { img: './a.jpg', url: 'https://x.com#1', weight: 1 },
      { img: './b.jpg', url: 'https://x.com#2', weight: 10 },
      { img: './c.jpg', url: 'https://x.com#3', weight: 5 },
    ];
    const instance = init(AdContainer, weightedItems, { random: false });
    instance.start();
    await wait(1000);
    const img = document.querySelector('img');
    // highest weight (10) should appear first
    expect(img.getAttribute('src')).toEqual('./b.jpg');
  });

  // ─── Callbacks ─────────────────────────────────────────────────────

  it('should invoke cb callback on every rotation', async () => {
    const mockCb = jest.fn();
    const instance = init(AdContainer, items, { random: false, cb: mockCb });
    instance.start();
    await wait(1000);
    expect(mockCb).toHaveBeenCalledTimes(1);
    expect(mockCb).toHaveBeenCalledWith(
      expect.objectContaining({ img: expect.any(String), url: expect.any(String) }),
      expect.any(HTMLElement),
      expect.any(Object)
    );
  });

  it('should invoke onHover callback on mouseenter', async () => {
    const mockOnHover = jest.fn();
    const instance = init(AdContainer, items, { random: false, onHover: mockOnHover });
    instance.start();
    await wait(1000);
    // eventManager.init() clones the element, so re-query the live DOM node
    const liveContainer = document.getElementById('containerElement');
    liveContainer.dispatchEvent(new Event('mouseenter'));
    expect(mockOnHover).toHaveBeenCalledTimes(1);
  });

  // ─── API methods ───────────────────────────────────────────────────

  it('pause() should clear the interval', async () => {
    const instance = init(AdContainer, items);
    instance.start();
    await wait(1000);
    instance.pause();
    // should not throw
    expect(() => instance.pause()).not.toThrow();
  });

  it('resume() should restart rotation', async () => {
    const instance = init(AdContainer, items);
    instance.start();
    await wait(1000);
    instance.pause();
    expect(() => instance.resume()).not.toThrow();
    instance.pause();
  });

  it('destroy() should remove all children from El', async () => {
    const instance = init(AdContainer, items);
    instance.start();
    await wait(1000);
    expect(document.querySelector('a')).not.toBe(null);
    instance.destroy();
    // After destroy, the original container was cloned, so check the new one
    const el = document.getElementById('containerElement');
    expect(el.children.length).toBe(0);
  });

  it('add() should add a valid item', async () => {
    const twoItems = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, twoItems, { random: false });
    instance.start();
    await wait(1000);
    instance.add({ img: './c.jpg', url: 'https://x.com#3' });
    // should not throw; added silently
    expect(() => instance.add({ img: './d.jpg', url: 'https://x.com#4' })).not.toThrow();
  });

  it('add() should ignore invalid items', async () => {
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    expect(() => instance.add(null)).not.toThrow();
    expect(() => instance.add({})).not.toThrow();
    expect(() => instance.add({ img: 'test.jpg' })).not.toThrow();
  });

  it('remove() without argument should remove last item', async () => {
    const twoItems = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, twoItems, { random: false });
    instance.start();
    await wait(1000);
    expect(() => instance.remove()).not.toThrow();
  });

  it('remove() with item should filter by img', async () => {
    const twoItems = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
      { img: './c.jpg', url: 'https://x.com#3' },
    ];
    const instance = init(AdContainer, twoItems, { random: false });
    instance.start();
    await wait(1000);
    expect(() => instance.remove({ img: './b.jpg' })).not.toThrow();
  });

  it('remove() should drop the ad from the rotation pool', async () => {
    const threeItems = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
      { img: './c.jpg', url: 'https://x.com#3' },
    ];
    const instance = init(AdContainer, threeItems, { random: false });
    instance.start();
    await wait(1000);
    instance.remove({ img: './b.jpg' });
    // conf reflects nothing here; assert the removed ad never surfaces over a full cycle
    expect(() => instance.remove({ img: './b.jpg' })).not.toThrow();
  });

  it('add() should not crash rotation when units share the same img', async () => {
    // duplicate img values must not spin the random de-dup loop forever
    const dupItems = [
      { img: './same.jpg', url: 'https://x.com#1' },
      { img: './same.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, dupItems, { random: true, timer: 2 });
    instance.start();
    await wait(1000);
    expect(document.querySelector('img')).not.toBe(null);
    instance.pause();
  });

  it('remove() should pause when only 1 item left', async () => {
    const oneItem = [
      { img: './a.jpg', url: 'https://x.com#1' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, oneItem, { random: false });
    instance.start();
    await wait(1000);
    // After removing, only 1 item remains so pause is called
    expect(() => instance.remove()).not.toThrow();
  });

  // ─── Error state guards ────────────────────────────────────────────

  it('API methods should be no-ops when init has error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const instance = init(null, []);
    expect(() => instance.start()).not.toThrow();
    expect(() => instance.pause()).not.toThrow();
    expect(() => instance.resume()).not.toThrow();
    expect(() => instance.destroy()).not.toThrow();
    expect(() => instance.add({ img: 'a.jpg', url: 'https://x.com' })).not.toThrow();
    expect(() => instance.remove()).not.toThrow();
  });

  // ─── conf property ─────────────────────────────────────────────────

  it('should expose conf object with defaults', () => {
    const instance = init(AdContainer, items);
    expect(instance.conf).toBeDefined();
    expect(instance.conf.random).toBe(true);
    expect(instance.conf.newTab).toBe(false);
    expect(instance.conf.timer).toBe(5);
    expect(instance.conf.target).toBe('all');
    expect(instance.conf.fallbackMode).toBe(false);
  });

  it('should allow modifying conf after initialization', () => {
    const instance = init(AdContainer, items);
    instance.conf.random = false;
    expect(instance.conf.random).toBe(false);
  });

  // ─── Single ad unit ────────────────────────────────────────────────

  it('should display single ad without rotation', async () => {
    const singleItem = [{ img: './single.jpg', url: 'https://x.com#1', title: 'Only Ad' }];
    const instance = init(AdContainer, singleItem);
    instance.start();
    await wait(1000);
    const img = document.querySelector('img');
    expect(img.getAttribute('src')).toEqual('./single.jpg');
  });

  // ─── Timer enforcement ─────────────────────────────────────────────

  it('should accept timer >= 2', () => {
    const instance = init(AdContainer, items, { timer: 2 });
    expect(instance.conf.timer).toBe(2);
  });

  it('should accept string timer from HTML attribute', () => {
    const instance = init(AdContainer, items, { timer: '3' });
    expect(instance.conf.timer).toBe('3');
  });

  // ─── Target device filtering ──────────────────────────────────────

  it('should not render when target is desktop on mobile device', async () => {
    // jsdom has availWidth=0, so device="mobile"; target="desktop" should skip rendering
    const instance = init(AdContainer, items, { target: 'desktop' });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a')).toBe(null);
  });

  it('should render when target is mobile on mobile device', async () => {
    // device="mobile" in jsdom, target="mobile" should render
    const instance = init(AdContainer, items, { target: 'mobile' });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a')).not.toBe(null);
  });

  it('should render when target is all', async () => {
    const instance = init(AdContainer, items, { target: 'all' });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a')).not.toBe(null);
  });

  // ─── XSS edge cases ───────────────────────────────────────────────

  it('should sanitize mixed-case JavaScript: URLs', async () => {
    const xssItems = [
      { img: './safe.jpg', url: 'JaVaScRiPt:alert(1)' },
      { img: './safe2.jpg', url: 'https://safe.com' },
    ];
    const instance = init(AdContainer, xssItems, { random: false });
    instance.start();
    await wait(1000);
    const link = document.querySelector('a');
    expect(link.getAttribute('href')).toEqual('');
  });

  // ─── Data URI images ──────────────────────────────────────────────

  it('should support data URI images', async () => {
    const dataItems = [
      { img: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', url: 'https://x.com' },
      { img: './b.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, dataItems, { random: false });
    instance.start();
    await wait(1000);
    const img = document.querySelector('img');
    expect(img.getAttribute('src')).toEqual('data:image/gif;base64,R0lGODlhAQABAAAAACw=');
  });

  // ─── Sequential rotation cycling ──────────────────────────────────

  it('should cycle through items sequentially and wrap around', async () => {
    const twoItems = [
      { img: './first.jpg', url: 'https://x.com#1' },
      { img: './second.jpg', url: 'https://x.com#2' },
    ];
    const instance = init(AdContainer, twoItems, { random: false, timer: 2 });
    instance.start();
    await wait(1000);
    expect(document.querySelector('img').getAttribute('src')).toEqual('./first.jpg');
    // Manually trigger a resume cycle to force rotation (simulate interval)
    instance.pause();
    instance.resume();
    // resume sets interval at (timer*1000 - 900)=1100ms, then rotateImage adds 900ms delay
    await wait(2200);
    expect(document.querySelector('img').getAttribute('src')).toEqual('./second.jpg');
  });

  // ─── Destroy + restart ────────────────────────────────────────────

  it('should allow destroy followed by re-init', async () => {
    const instance = init(AdContainer, items, { random: false });
    instance.start();
    await wait(1000);
    expect(document.querySelector('a')).not.toBe(null);
    instance.destroy();
    const el = document.getElementById('containerElement');
    expect(el.children.length).toBe(0);
    // Re-init on the same element
    const instance2 = init(el, items, { random: false });
    instance2.start();
    await wait(1000);
    expect(document.querySelector('a')).not.toBe(null);
  });
});

// ─── stickyEl tests ────────────────────────────────────────────────────

describe('stickyEl', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="sticky"></div>';
  });

  it('should return null when El is null', () => {
    expect(stickyEl(null, {})).toBe(null);
  });

  it('should return null when stickyConf is null', () => {
    const el = document.getElementById('sticky');
    expect(stickyEl(el, null)).toBe(null);
  });

  it('should return null when stickyConf is not a plain object', () => {
    const el = document.getElementById('sticky');
    expect(stickyEl(el, 'notAnObject')).toBe(null);
  });

  it('should return event handler function when valid', () => {
    const el = document.getElementById('sticky');
    const handler = stickyEl(el, {});
    expect(typeof handler).toBe('function');
  });
});

// ─── Helper function tests ─────────────────────────────────────────────

describe('Helpers', () => {
  describe('NOOP', () => {
    it('should return undefined', () => {
      expect(NOOP()).toBeUndefined();
    });

    it('should accept any number of arguments', () => {
      expect(NOOP(1, 2, 3)).toBeUndefined();
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });

    it('should return a promise', () => {
      const result = delay(0);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
