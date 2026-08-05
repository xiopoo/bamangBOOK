import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const editorial = path.resolve(import.meta.dirname, "../..");
const directories = [
  path.join(editorial, "buffett/illustrations/sketches"),
  path.join(editorial, "munger/illustrations/sketches"),
  path.join(editorial, "buffett/illustrations/refined"),
  path.join(editorial, "munger/illustrations/refined"),
];

const rendered = [];
for (const directory of directories) {
  for (const name of fs.readdirSync(directory).filter((file) => file.endsWith(".svg"))) {
    const source = path.join(directory, name);
    const target = source.replace(/\.svg$/u, ".png");
    await sharp(source, { density: 144 }).png().toFile(target);
    rendered.push(path.relative(editorial, target));
  }
}

console.log(JSON.stringify({ rendered: rendered.length, files: rendered }, null, 2));
