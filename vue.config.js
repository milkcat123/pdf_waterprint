const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === "production" ? "/pdf_waterprint/" : "/",
  lintOnSave: true,
  transpileDependencies: true,
  pages: {
    index: {
      entry: "./src/main.js",
      title: "PDF浮水印工具",
    },
  },
  css: {
    sourceMap: true,
  },
});
