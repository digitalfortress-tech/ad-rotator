// Ambient module declarations for non-code side-effect imports.
// Keeps `import './style.less'` type-checking cleanly without shipping
// these shims in the public type surface (see src/types.d.ts for that).
declare module '*.less';
declare module '*.css';
