// const Vue = require("vue");
const fs = require("fs");
const express = require("express");
const { createBundleRenderer } = require("vue-server-renderer");
const server = express();
const setupDevServer = require("./build/setup-dev-server");

// serverBundle
// template
// clientManifest  这三个是打包构建必须要的三个变量
// 生产模式下 我们直接运用原始的打包构建就可以了
// 开发模式下，我们需要实时监听并打包，然后刷新页面

const isprod = process.env.NODE_ENV === "production";

let renderer;
let onReady;
if (isprod) {
  const serverBundle = require("./dist/vue-ssr-server-bundle.json");
  const template = fs.readFileSync("./index.template.html", "utf-8");
  const clientManifest = require("./dist/vue-ssr-client-manifest.json");
  // 这样就得到了一个render渲染器
  renderer = createBundleRenderer(serverBundle, {
    // 以同步方式读出模板，因为读出来是二进制，所以设置utf-8
    template,
    clientManifest,
  });
} else {
  // 开发模式 // 打包构建（客户端 + 服务端） -> 创建渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
    });
  });
}

const render = (req, res) => {
  renderer.renderToString(
    {
      title: "拉勾教育",
      meta: ` <meta name="description" content="拉勾教育"> `,
    },
    (err, html) => {
      if (err) {
        return res.status(500).end("Internal Server Error");
      }
      res.setHeader("Content-type", "text/html; charset=utf8");
      res.end(html);
    }
  );
};

server.use("/dist", express.static("./dist"));
server.get(
  "/",
  isprod
    ? render
    : async (req, res) => {
        // 开发模式render的参数渲染好了就执行
        await onReady;
        render(req, res);
      }
);

server.listen(3000, () => {
  console.log("server running at port 3000.");
});
