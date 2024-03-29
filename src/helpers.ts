/**
 * A no-operation Function
 * @param args
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const NOOP = (...args: unknown[]): unknown => undefined;

/**
 * A function to delay execution
 * @param {Number} ms Timeout in ms
 */
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
