"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rdir = exports.rext = exports.reserveFiles = exports.entryFiles = void 0;

/**
 * @file routes check entities
 */
const entryFiles = ['index.jsx', 'index.js', 'index.tsx', 'layout.jsx', 'layout.ts', 'layout.tsx'];
exports.entryFiles = entryFiles;
const reserveFiles = ['index.tsx', 'index.ts', 'index.js', 'index.jsx', 'layout.js', 'layout.jsx', 'layout.ts', 'layout.tsx', 'fallback.tsx', 'fallback.ts', 'fallback.js', 'fallback.jsx', '404.ts', '404.tsx', '404.js', '404.jsx'];
exports.reserveFiles = reserveFiles;
const rext = /\.gif|\.svg|\.jpg|\.png|\.css|\.less|\.scss|\.ts$/;
exports.rext = rext;
const rdir = /\/components|\/images/;
exports.rdir = rdir;