const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    publicPath: process.env.NODE_ENV === "production" ? "/pdf_waterprint/" : "/",
  lintOnSave: true,
  transpileDependencies: true,
  css: {
    sourceMap: true,
  },
});
