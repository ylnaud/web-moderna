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

  eleventyConfig.addPassthroughCopy("code/app");
  eleventyConfig.addPassthroughCopy("code/img");
  eleventyConfig.addPassthroughCopy("code/svg");

  // Crear una colección de etiquetas
  eleventyConfig.addCollection("tags", function (collectionApi) {
    let tagsObj = {};
    collectionApi.getAll().forEach((item) => {
      if (!item.data.tags) return;
      item.data.tags.forEach((tag) => {
        if (!tagsObj[tag]) {
          tagsObj[tag] = [];
        }
        tagsObj[tag].push(item);
      });
    });
    return tagsObj;
  });

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
    async (src, className = "", title = "", desc = "") => {
      try {
        const filePath = path.join(__dirname, "code/svg", src);
        let svgContent = await fs.readFile(filePath, "utf-8");

        // Generar ID único basado en el nombre del archivo
        const idBase = src.replace(".svg", "").replace(/\W+/g, "-");

        // Crear el bloque de metadatos SEO
        const seoMetadata = `
          <title id="${idBase}-title">${title}</title>
          <desc id="${idBase}-desc">${desc}</desc>
        `;

        // Buscar la etiqueta de apertura <svg
        const svgTagMatch = svgContent.match(/<svg[^>]*>/);
        if (!svgTagMatch) throw new Error("No se encontró la etiqueta <svg>");

        const svgTag = svgTagMatch[0];

        // Modificar la etiqueta <svg> agregando los atributos SEO
        const modifiedSvgTag = svgTag.replace(
          "<svg",
          `<svg class="${className}" role="img" aria-labelledby="${idBase}-title ${idBase}-desc"`
        );

        // Reemplazar la etiqueta <svg> en el contenido con la modificada
        svgContent = svgContent.replace(svgTag, modifiedSvgTag);

        // Insertar title y desc inmediatamente después de la apertura de <svg>
        svgContent = svgContent.replace(
          modifiedSvgTag,
          `${modifiedSvgTag}${seoMetadata}`
        );

        return svgContent;
      } catch (error) {
        console.error(`Error leyendo el SVG ${src}:`, error);
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
        minifyCSS: true,
        minifyJS: true,
      });
      return minified;
    }
    return content;
  });

  // Plugins

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "avif"],
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

  eleventyConfig.addFilter("slugify", function (str, maxLength = 50) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, maxLength) // Limita la longitud
      .replace(/-+$/, ""); // Elimina guiones al final después de truncar
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
