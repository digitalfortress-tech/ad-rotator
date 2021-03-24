/* eslint-disable @typescript-eslint/no-empty-function */
import adRotator from './ad-rotator';

describe('Ad-rotator', () => {
  const mockIntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = mockIntersectionObserver;

  const items = [
    { img: './assets/image.jpg', url: 'https://xyz.com#1' }, // ad 1
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
    const rotator = new adRotator(AdContainer, items);
    rotator.start();
    await new Promise((res) => setTimeout(res, 1000));
    const link = document.querySelector('a');
    const img = document.querySelector('img');
    expect(link).not.toBe(null);
    expect(img).not.toBe(null);
  });

  it('should display an advert with custom options', async () => {
    const mockOnClick = jest.fn();
    const rotator = new adRotator(AdContainer, items, {
      shape: 'sidebar',
      imgClass: 'test-image',
      linkClass: 'test-link',
      random: false,
      newTab: true,
      onClick: mockOnClick,
      timer: 1000,
      objectFit: 'cover',
    });
    rotator.start();

    // verify first image
    await new Promise((res) => setTimeout(res, 800));
    const link = document.querySelector('a.test-link');
    const img = document.querySelector('img.test-image');
    expect(img.getAttribute('src')).toEqual('./assets/image.jpg');
    expect(link.getAttribute('href')).toEqual('https://xyz.com#1');

    // verify shape
    expect(img.getAttribute('width')).toEqual('300');
    expect(img.getAttribute('height')).toEqual('600');

    // verify newTab prop
    expect(link.getAttribute('target')).toEqual('_blank');

    // verify style => object-fit
    expect(img.getAttribute('style')).toEqual('object-fit: cover;');

    // test onClick callback
    link.click();
    expect(mockOnClick).toHaveBeenCalled();
  });
});
