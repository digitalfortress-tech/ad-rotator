/* eslint-disable @typescript-eslint/no-empty-function */
import { init } from './ad-rotator';

describe('Ad-rotator', () => {
  const mockIntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = mockIntersectionObserver;

  const items = [
    { img: './assets/image.jpg', url: 'https://xyz.com#1', title: 'Ad 1' }, // ad 1
    { img: 'https://xyz.com/image.png', url: 'https://xyz.com#2' }, // ad 2
    { img: 'https://xyz.com/image.svg', url: 'https://xyz.com#3' }, // ad 3
    { img: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', url: 'https://xyz.com#4' }, // ad 4
  ];
  let AdContainer;

  beforeEach(() => {
    document.body.innerHTML = '<div id="containerElement"></div>';
    AdContainer = document.getElementById('containerElement');
  });

  it('should display an advert with default options', async () => {
    const instance = init(AdContainer, items);
    instance.start();
    await new Promise((res) => setTimeout(res, 1000));
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

    // verify first image
    await new Promise((res) => setTimeout(res, 1800));
    const link = document.querySelector('a.test-link');
    const img = document.querySelector('img.test-image');
    expect(img.getAttribute('src')).toEqual('./assets/image.jpg');
    expect(img.getAttribute('alt')).toEqual('Ad 1');
    expect(link.getAttribute('href')).toEqual('https://xyz.com#1');
    expect(link.getAttribute('title')).toEqual('Ad 1');
    expect(link.getAttribute('aria-label')).toEqual('Ad 1');

    // verify newTab prop
    expect(link.getAttribute('target')).toEqual('_blank');

    // test onClick callback
    link.click();
    expect(mockOnClick).toHaveBeenCalled();
  });
});
