const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const terser = require("terser");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img"); // ✅ CORREGIDO

module.exports = function (eleventyConfig) {
  // Archivos a copiar directamente
  eleventyConfig.addPassthroughCopy("code/css");
  eleventyConfig.addPassthroughCopy("code/js");
  eleventyConfig.addPassthroughCopy("code/img");

  // HTML minify
  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Plugins (Ahora correctamente importados)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp"],
    widths: ["auto"],
    htmlOptions: {
      imgAttributes: {
        decoding: "async",
        loading: "lazy",
        width: "200",
        height: "auto",
      },
      pictureAttributes: { class: "picture miguel" },
    },
  });

  // Filtros para minificar CSS y JS
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter("jsmin", async function (code) {
    try {
      const minified = await terser.minify(code);
      return minified.code;
    } catch (err) {
      console.error("Terser error: ", err);
      return code;
    }
  });

  return {
    dir: {
      input: "code",
      output: "docs",
    },
  };
};
