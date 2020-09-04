const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const webpack = require("webpack");
const devMiddleware = require("webpack-dev-middleware");
module.exports = (server, callback) => {
  let ready;
  const onReady = new Promise((r) => (ready = r));

  // 监视构建  => 更新 Renderer
  let template;
  let serverBundle;
  let clientManifest;

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready();
      callback(template, serverBundle, clientManifest);
    }
  };
  // 构建 template
  const templatePath = path.resolve(__dirname, "../index.template.html");
  template = fs.readFileSync(templatePath, "utf-8");
  update();
  chokidar.watch(templatePath).on("change", () => {
    template = fs.readFileSync(templatePath, "utf-8");
    update();
  });

  // 构建 serverBundle
  const serverConfig = require("./webpack.server.config");
  const serverCompiler = webpack(serverConfig);
  // 使用webpack提供的插件，将文件存储到内存中
  // 使用内存中的文件信息，需要在返回值的fileSystem中读取
  // webpack-dev-middleware
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: "silent",
  });
  // 这是一个钩子函数，就是每次编译完成后都执行的钩子函数
  serverCompiler.hooks.done.tap("server", () => {
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(
        path.resolve(__dirname, "../dist/vue-ssr-server-bundle.json"),
        "utf-8"
      )
    );
    console.log(serverBundle);
    update();
  });

  // 创建到硬盘上
  // serverCompiler.watch({}, (err, stats) => {
  //   if (err) throw err;
  //   if (stats.hasErrors()) return;
  //   serverBundle = JSON.parse(
  //     fs.readFileSync(
  //       path.resolve(__dirname, "../dist/vue-ssr-server-bundle.json"),
  //       "utf-8"
  //     )
  //   );
  //   update();
  // });

  // 文件监视  fs.watch , fs.watchFile
  // chokidar 基于fs.watch , fs.watchFile 封装的方法

  // 监视构建  template => 调用 update => 更新Renderer 渲染器
  // 监视构建  serverBundle => 调用 update => 更新Renderer 渲染器
  // 监视构建  clientManifest => 调用 update => 更新Renderer 渲染器

  return onReady;
};
