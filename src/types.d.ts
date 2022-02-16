export type Dictionary<T = unknown> = Record<string, T>;

export interface AdUnit extends Dictionary<unknown> {
  img: string;
  url: string;
  weight?: number;
}

export interface StickyConfig {
  beforeEl?: HTMLElement;
  afterEl?: HTMLElement;
  offsetTop?: string;
  offsetBottom?: string;
  noMobile?: boolean;
}

export interface AdConfig {
  imgClass?: string;
  linkClass?: string;
  objectFit?: 'inherit' | 'contain' | 'cover' | 'none' | 'fill' | 'inital' | 'revert' | 'scale-down' | 'unset';
  sticky?: StickyConfig;
  target?: 'all' | 'desktop' | 'mobile';
  timer?: number;
  random?: boolean;
  newTab?: boolean;
  cb?: (unit: AdUnit, El: HTMLElement, conf: AdConfig) => unknown;
  onHover?: (prevItem: AdUnit | null, El: HTMLElement) => unknown;
  onClick?: (e: MouseEvent, unit: AdUnit) => unknown;
  fallbackMode?: boolean;
}

export interface EventManager {
  scrollEvRef: null | ((this: Window, event: Event) => void);
  obs: IntersectionObserver | null;
  init: () => void;
  destroy: () => void;
  obsCb: IntersectionObserverCallback;
}

export interface AdRotatorInstance {
  conf: AdConfig;
  start: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  add: (item: AdUnit) => void;
  remove: (item: AdUnit) => void;
}
