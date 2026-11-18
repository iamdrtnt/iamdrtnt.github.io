import { defineConfig } from "astro/config";
export default defineConfig({
  site: "https://iamdrtnt.github.io",
  base: "/",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
});
