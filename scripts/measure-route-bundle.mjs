import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const route = (process.argv[2] ?? "dashboard").replace(/^\/+|\/+$/g, "");
const buildDir = path.resolve(".next");
const htmlPath = path.join(buildDir, "server", "app", `${route}.html`);
const html = await readFile(htmlPath, "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.js(?:\?[^"]*)?)"/g)]
  .map((match) => match[1].split("?")[0])
  .filter((ref, index, all) => all.indexOf(ref) === index);

const assets = await Promise.all(refs.map(async (ref) => {
  const relative = ref.replace(/^\/_next\//, "");
  const bytes = (await stat(path.join(buildDir, relative))).size;
  return { ref, bytes };
}));
const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
console.log(JSON.stringify({ route, assetCount: assets.length, totalBytes, totalKiB: Number((totalBytes / 1024).toFixed(1)), assets }, null, 2));
