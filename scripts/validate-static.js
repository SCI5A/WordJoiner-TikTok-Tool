#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'index.html',
  'style.css',
  'script.js',
  'arabic-spacing.js',
  'arabic-text-formatter.js',
  'quran-segmentation.js',
  'docx-export.js',
  'sw.js',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

const missing = requiredFiles.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length > 0) {
  console.error(`Missing required static assets: ${missing.join(', ')}`);
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const requiredHtmlMarkers = [
  '<html lang="ar" dir="rtl">',
  '<meta name="description"',
  '<link rel="canonical"',
  '<meta property="og:title"',
  'id="inputText"',
  'id="outputText"',
  'id="exportPdfBtn"',
  'id="exportDocxBtn"'
];
const missingHtmlMarkers = requiredHtmlMarkers.filter(marker => !index.includes(marker));
if (missingHtmlMarkers.length > 0) {
  console.error(`Missing required HTML markers: ${missingHtmlMarkers.join(', ')}`);
  process.exit(1);
}

if (manifest.display !== 'standalone' || !manifest.start_url || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  console.error('Manifest must remain a standalone PWA with a start URL and icons.');
  process.exit(1);
}

if (!serviceWorker.includes("wordjoiner-pro-v17") || !serviceWorker.includes("'./arabic-text-formatter.js?v=2'") || !serviceWorker.includes("'./robots.txt'") || !serviceWorker.includes("'./sitemap.xml'")) {
  console.error('Service Worker cache version or SEO assets are not up to date.');
  process.exit(1);
}

console.log(`Static validation passed: ${requiredFiles.length} required files, RTL metadata, formatter v2, export controls, and SW v17.`);
