import { createApp } from "./app";

export default (context) => {
  const { app } = createApp();

  // 这里会有，服务端路由处理，数据预取的逻辑
  return app;
};
