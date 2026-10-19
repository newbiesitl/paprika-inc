import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("./", import.meta.url);
const result = await build({
  entryPoints: [
    new URL("src/main.mjs", root).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
  ],
  bundle: true,
  write: false,
  format: "iife",
  target: "es2022",
  minify: true,
});
const template = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("style.css", root), "utf8");
const logo = await readFile(
  new URL("../../plugins/paprika-inc/assets/paprika-inc-icon.png", root),
);
const html = template
  .replace("</head>", "<style>" + css + "</style></head>")
  .replace("__LOGO__", "data:image/png;base64," + logo.toString("base64"))
  .replace("__SCRIPT__", () =>
    result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script"),
  );
await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/catalog.html", root), html);
console.log("Built self-contained catalog resource (no CDN dependencies).");
