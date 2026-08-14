#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const directory = path.join(root, "content/source-documents/berkshire-shareholder-letters");
const repaired = [];

for (let year = 1977; year <= 1997; year += 1) {
  const absolute = path.join(directory, `${year}.html`);
  const buffer = fs.readFileSync(absolute);
  const head = buffer.subarray(0, 5000).toString("latin1");
  if (/<html|<body|<pre/iu.test(head)) continue;

  let decoded;
  try {
    decoded = zlib.brotliDecompressSync(buffer);
  } catch (error) {
    throw new Error(`${year}.html is neither readable HTML nor Brotli data: ${error.message}`);
  }
  const decodedHead = decoded.subarray(0, 5000).toString("latin1");
  if (!/<html|<body|<pre/iu.test(decodedHead)) throw new Error(`${year}.html decoded but did not become HTML`);
  fs.writeFileSync(absolute, decoded);
  repaired.push({ year, beforeBytes: buffer.length, afterBytes: decoded.length });
}

console.log(JSON.stringify({ repaired: repaired.length, files: repaired }, null, 2));
