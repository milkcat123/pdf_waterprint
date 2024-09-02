const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath: "/",
  lintOnSave: true,
  transpileDependencies: true,
  css: {
    sourceMap: true,
  },
});
