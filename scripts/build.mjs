import { build } from "esbuild";
import { writeFileSync, chmodSync } from "fs";

await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/cli.js",
  external: ["commander"],
  banner: {
    js: "#!/usr/bin/env node",
  },
  minify: false,
});

chmodSync("dist/cli.js", 0o755);
console.log("Built dist/cli.js");
