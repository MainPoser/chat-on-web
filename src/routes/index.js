const express = require("express");
const path = require("path");
const router = express.Router();
const { PUBLIC_DIR } = require('../config/constants');

// 所有其他路由都指向index.html（用于SPA路由），但排除静态资源路径
router.get("*", (req, res) => {
  // 排除静态资源路径
  if (req.path.startsWith('/cdn-images/') || req.path.startsWith('/emojis/')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

module.exports = router;