const fs = require("fs").promises;
const path = require("path");
const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const terser = require("terser");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Archivos a copiar directamente
  eleventyConfig.addPassthroughCopy("code/css");
  eleventyConfig.addPassthroughCopy("code/js");
  eleventyConfig.addPassthroughCopy("code/img");
  eleventyConfig.addPassthroughCopy("code/svg");

  // svg passthrough
  eleventyConfig.addNunjucksAsyncShortcode(
    "svgIcon",
    async (src, className = "") => {
      try {
        const filePath = path.join(__dirname, "code/svg", src);
        //console.log(`Reading SVG file from: ${filePath}`);

        let svgContent = await fs.readFile(filePath, "utf-8");
        //console.log(`Original SVG content:\n${svgContent}`);

        // Agregar la clase al elemento SVG
        svgContent = svgContent.replace("<svg", `<svg class="${className}"`);
        //console.log(`Modified SVG content:\n${svgContent}`);

        return svgContent;
      } catch (error) {
        console.error(`Error reading SVG file ${src}:`, error);
        return "";
      }
    }
  );
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

  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp"],
    widths: ["auto"],
    htmlOptions: {
      imgAttributes: {
        decoding: "async",
        loading: "lazy",
        width: "auto",
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
