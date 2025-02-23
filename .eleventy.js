import { createInlineCss } from "google-fonts-inline";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import htmlmin from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify } from "terser";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// Obtener la ruta del directorio actual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (eleventyConfig) {
  // Archivos a copiar directamente
  eleventyConfig.addPassthroughCopy("code/css");
  eleventyConfig.addPassthroughCopy("code/js");
  eleventyConfig.addPassthroughCopy("code/img");
  eleventyConfig.addPassthroughCopy("code/svg");

  // Crear un shortcode para generar CSS en línea de Google Fonts
  eleventyConfig.addShortcode("googleFontsInline", async function (url) {
    try {
      const css = await createInlineCss(url);
      return css;
    } catch (error) {
      console.error("Error al generar el CSS en línea:", error);
      return "";
    }
  });

  // svg passthrough
  eleventyConfig.addNunjucksAsyncShortcode(
    "svgIcon",
    async (src, className = "") => {
      try {
        const filePath = path.join(__dirname, "code/svg", src);
        let svgContent = await fs.readFile(filePath, "utf-8");
        svgContent = svgContent.replace("<svg", `<svg class="${className}"`);
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
      const minified = await minify(code);
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
}
