const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");

// 导入拆分的模块
const socketHandler = require("./websocket/socketHandler");
const apiRoutes = require("./routes/api");
const rootRoutes = require("./routes/index");
const storageService = require("./services/storageService"); 
const { CDN_SIZE_CHECK_INTERVAL_MS, ROOT_DIR } = require('./config/constants');


// --- 启动时执行逻辑 (原全局逻辑) ---
// 0. 初始化数据文件
storageService.initializeDataFiles();

// 1. 服务重启时清理CDN目录所有文件
storageService.cleanCdnDirectoryOnRestart();

// 2. 启动定期检查
setInterval(storageService.checkDirectorySize, CDN_SIZE_CHECK_INTERVAL_MS);

// 3. 初始检查
setTimeout(storageService.checkDirectorySize, 10000); 

// --- 创建应用与服务器 ---
const app = express();
const server = http.createServer(app);

// 添加JSON中间件，用于解析JSON请求体
app.use(express.json());

// 创建WebSocket服务器
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 将 io 实例挂载到 app 上，供 API 路由 (如 /api/update-nickname) 使用
app.set('io', io);


// --- 专门处理CDN图片的路由 ---
app.get('/cdn-images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(ROOT_DIR, "public", "cdn-images", filename);
  
  // 检查文件是否存在
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Image not found');
  }
  
  // 设置正确的Content-Type
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (ext === '.gif') {
    res.setHeader('Content-Type', 'image/gif');
  }
  
  // 发送文件
  res.sendFile(filePath);
});

// --- 静态文件配置 (原全局逻辑) ---
// 设置CDN图片目录为静态文件目录
app.use('/cdn-images', express.static(path.join(ROOT_DIR, "public", "cdn-images")));
// 设置emojis目录为静态文件目录，放在API路由之后
app.use('/emojis', express.static(path.join(ROOT_DIR, "data", "emojis")));
// 设置静态目录，用于存放Vue打包后的文件
app.use(express.static(path.join(ROOT_DIR, "public")));

// --- 路由配置 ---
app.use('/api', apiRoutes);
app.use(rootRoutes);


// --- WebSocket 连接处理 ---
socketHandler(io);


// 导出server以便在入口文件启动
module.exports = { app, server, io };