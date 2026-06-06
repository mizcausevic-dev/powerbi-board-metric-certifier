import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const markers = [
  "Power BI Board Metric Certifier",
  "Board metrics should be certified",
  "Net revenue retention",
  "Primary recommendation"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

console.log("smoke ok");
