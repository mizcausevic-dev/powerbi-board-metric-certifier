#!/usr/bin/env node
import { loadCertification, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: powerbi-board-metric-certifier <input.json> [--format markdown|json]");
  process.exit(1);
}

const certification = await loadCertification(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(certification, null, 2) : renderMarkdown(certification));
