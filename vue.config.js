module.exports = {
    publicPath: './',
    outputDir: 'dist',
    assetsDir: 'static',
    indexPath: 'index.html',
    filenameHashing: true,
    lintOnSave: true,
    runtimeCompiler: true,
    transpileDependencies: ['pdfjs-dist'],
    productionSourceMap: true,
    integrity: false,
    configureWebpack: {
        resolve: { extensions: ['.ts', '.tsx', '.js', '.json'] },
        module: {
            rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
        }
    },
    devServer: {
        proxy: {
            'pdfapi': {
                target: 'https://app-websctest-pdfreader-dev-001.azurewebsites.net', //目標介面域名
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    'pdfapi': '/api' //重寫介面
                }
                //   ws: true
            }
        } // 設定代理
    }
};
