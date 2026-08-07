const { copyFileSync, readFileSync, writeFileSync } = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const Image = require("@11ty/eleventy-img").default;
const CleanCSS = require("clean-css");
const { PurgeCSS } = require("purgecss");
const { minify } = require("terser");

module.exports = function (eleventyConfig) {
  // --- Build-time Tailwind CSS (replaces the runtime Play CDN) ---
  // Compiles the utility CSS from source so no JavaScript is shipped to the
  // browser and nothing renders on the main thread.
  eleventyConfig.on("eleventy.before", () => {
    execFileSync(
      path.join(__dirname, "node_modules", ".bin", "tailwindcss"),
      ["-i", "tailwind.input.css", "-o", "_site/styles/tailwind.css", "--minify"],
      { stdio: "inherit" }
    );
  });
  // --- Static assets: passthrough copy (preserves original URLs) ---
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("src/favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/Photo.jpg");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // .htaccess starts with a dot, which Eleventy's passthrough copy skips,
  // so copy it explicitly after each build. Then purge dead rules from the
  // legacy main.css (its utility classes are now provided by tailwind.css)
  // and minify the static CSS/JS in place (whitespace/comments only — no
  // behaviour change) to satisfy Lighthouse's minify-css/js audits.
  eleventyConfig.on("eleventy.after", async () => {
    copyFileSync("src/.htaccess", "_site/.htaccess");

    const mainCssPath = "_site/styles/main.css";
    const htmlFiles = walkHtmlFiles("_site");
    const [{ css: purgedCss }] = await new PurgeCSS().purge({
      content: htmlFiles.concat(["src/js/main.js", "src/js/navbar.js"]),
      css: [{ raw: readFileSync(mainCssPath, "utf8") }]
    });
    writeFileSync(mainCssPath, new CleanCSS({ level: 1 }).minify(purgedCss).styles);

    for (const cssFile of ["_site/styles/theme.css"]) {
      const minified = new CleanCSS({ level: 1 }).minify(readFileSync(cssFile, "utf8")).styles;
      writeFileSync(cssFile, minified);
    }

    for (const jsFile of ["_site/js/main.js", "_site/js/navbar.js", "_site/js/theme.js"]) {
      const src = readFileSync(jsFile, "utf8");
      const { code } = await minify(src, { compress: false, mangle: false });
      writeFileSync(jsFile, code);
    }
  });

  // Shared responsive-image pipeline (kept identical for the <picture> shortcode
  // and the JSON feed's plain <img> src so filenames/URLs always match).
  const imageOptions = {
    widths: [400, 640, 800, 1024, 1280],
    formats: ["avif", "webp"],
    outputDir: "./_site/images/opt/",
    urlPath: "/images/opt/",
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}.${format}`;
    }
  };

  // --- Responsive image shortcode ---
  // Usage: {% image "/images/foo.png", "alt text", "css classes", "sizes", "eager|lazy", "inline style" %}
  // Generates AVIF + WebP at multiple widths with srcset/sizes, serving the
  // browser only the size/format it needs.
  eleventyConfig.addShortcode("image", async function (src, alt, className = "", sizes = "100vw", loading = "lazy", style = "", fetchpriority = "") {
    const fsPath = src.startsWith("/") ? `src${src}` : src;
    const metadata = await Image(fsPath, imageOptions);
    const attrs = { alt, sizes, loading, decoding: "async" };
    if (className) attrs.class = className;
    if (style) attrs.style = style;
    if (fetchpriority) attrs.fetchpriority = fetchpriority;
    return Image.generateHTML(metadata, attrs, { whitespaceMode: "inline" });
  });

  // Returns just the optimized <img> src for the JSON blog feed.
  // Usage (in templates): {{ "/images/foo.png" | imageUrl(800) | dump | safe }}
  eleventyConfig.addFilter("imageUrl", async function (src, width = 800) {
    if (!src) return "";
    const fsPath = src.startsWith("/") ? `src${src}` : src;
    const metadata = await Image(fsPath, imageOptions);
    const candidates = metadata.webp || metadata.avif || [];
    const match = candidates.find((e) => e.width === width) || candidates[candidates.length - 1];
    return match ? match.url : "";
  });

  // Format a Date as "October 1, 2025" (UTC-safe for date-only values)
  eleventyConfig.addFilter("readableDate", (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date(date));
  });

  // Slice a collection to its first N items (for the blog's static "first page")
  eleventyConfig.addFilter("limit", (arr, count) => (arr || []).slice(0, count));

  // Non-featured posts in the original listing order
  eleventyConfig.addCollection("postsSorted", (collection) => {
    return collection
      .getFilteredByTag("post")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  });

  // Live-reload when CSS/JS change (not just templates)
  eleventyConfig.setBrowserSyncConfig({
    files: ["src/styles/**/*.css", "src/js/**/*.js"]
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};

function walkHtmlFiles(dir) {
  const { readdirSync, statSync } = require("fs");
  const { join } = require("path");
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkHtmlFiles(full));
    } else if (entry.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}
