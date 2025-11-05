const fs = require("fs");
const path = require("path");
const { getUserPoints, reduceUserPoints, addUserPoints, getUserInfo } = require("./pointsService");

// 神秘老人商店数据存储文件路径
const MYSTERY_SHOP_DATA_FILE = path.join(__dirname, "..", "data", "mysteryShop.json");

// 确保数据目录存在
function ensureDataDirectory() {
  const dataDir = path.dirname(MYSTERY_SHOP_DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 初始化神秘商店数据文件
function initializeMysteryShopData() {
  ensureDataDirectory();
  if (!fs.existsSync(MYSTERY_SHOP_DATA_FILE)) {
    fs.writeFileSync(MYSTERY_SHOP_DATA_FILE, JSON.stringify({}), "utf8");
  }
}

// 读取神秘商店数据
function readMysteryShopData() {
  initializeMysteryShopData();
  try {
    const data = fs.readFileSync(MYSTERY_SHOP_DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("读取神秘商店数据失败:", error);
    return {};
  }
}

// 写入神秘商店数据
function writeMysteryShopData(data) {
  initializeMysteryShopData();
  try {
    fs.writeFileSync(MYSTERY_SHOP_DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("写入神秘商店数据失败:", error);
    return false;
  }
}

// 获取用户神秘商店数据
function getUserMysteryData(coreId) {
  if (!coreId) return null;
  
  const data = readMysteryShopData();
  return data[coreId] || null;
}

// 更新用户神秘商店数据
function updateUserMysteryData(coreId, mysteryData) {
  if (!coreId) return false;
  
  const data = readMysteryShopData();
  data[coreId] = {
    ...data[coreId],
    ...mysteryData,
    coreId: coreId,
    updatedAt: new Date().toISOString()
  };
  
  return writeMysteryShopData(data);
}

// 神秘礼物类型定义
const MYSTERY_REWARDS = [
  {
    id: "avatar_frame",
    name: "精美头像框",
    description: "获得精美头像框3天使用权",
    duration: 3, // 天数
    probability: 0.06, // 6%概率
    type: "avatar_frame"
  },
  {
    id: "entrance_animation",
    name: "登录出场炫酷动画",
    description: "获得登录出场炫酷动画3天使用权",
    duration: 3, // 天数
    probability: 0.08, // 8%概率
    type: "entrance_animation"
  },
  {
    id: "black_bomb",
    name: "黑色炸弹",
    description: "损失200积分，如果不足200，则扣到0积分",
    probability: 0.05, // 5%概率
    type: "punishment"
  }
];

// 抽取神秘礼物
function drawMysteryReward(coreId) {
  console.log(`[MYSTERY_SHOP] 开始抽取神秘礼物:`, { coreId });
  
  // 参数验证
  if (!coreId) {
    return {
      success: false,
      message: "用户ID不能为空"
    };
  }
  
  // 检查用户积分是否足够
  const userPoints = getUserPoints(coreId);
  if (userPoints < 100) {
    return {
      success: false,
      message: "积分不足，需要100积分才能抽取神秘礼物"
    };
  }
  
  // 扣除100积分
  const pointsDeducted = reduceUserPoints(coreId, 100);
  if (!pointsDeducted) {
    return {
      success: false,
      message: "积分扣除失败"
    };
  }
  
  // 生成随机数决定是否中奖
  const random = Math.random();
  let reward = null;
  let cumulativeProbability = 0;
  
  // 按照定义的概率检查每个奖励
  for (const rewardType of MYSTERY_REWARDS) {
    cumulativeProbability += rewardType.probability;
    
    if (random < cumulativeProbability) {
      reward = rewardType;
      break;
    }
  }
  
  // 如果没有中任何奖励，返回未中奖
  if (!reward) {
    return {
      success: true,
      reward: null,
      message: "很遗憾，您没有抽中任何礼物"
    };
  }
  
  // 处理黑色炸弹
  if (reward.type === "punishment") {
    // 扣除额外200积分（黑色炸弹）
    const currentPoints = getUserPoints(coreId);
    const pointsToDeduct = Math.min(200, currentPoints);
    const bombPointsDeducted = reduceUserPoints(coreId, pointsToDeduct);
    
    if (bombPointsDeducted) {
      return {
        success: true,
        reward: {
          ...reward,
          pointsLost: pointsToDeduct
        },
        message: `很遗憾，您抽中了黑色炸弹，损失了${pointsToDeduct}积分`
      };
    } else {
      // 如果扣除失败，退还之前扣除的100积分
      addUserPoints(coreId, 100);
      return {
        success: false,
        message: "积分处理失败，已退还抽取费用"
      };
    }
  }
  
  // 处理头像框
  if (reward.type === "avatar_frame") {
    // 获取用户当前神秘商店数据
    const userMysteryData = getUserMysteryData(coreId) || {};
    const currentAvatarFrame = userMysteryData.avatarFrame || {};
    
    // 计算新的过期时间
    const now = new Date();
    let newExpiryDate = new Date();
    newExpiryDate.setDate(now.getDate() + reward.duration);
    
    // 如果已有头像框且未过期，则累加天数
    if (currentAvatarFrame.expiryDate && new Date(currentAvatarFrame.expiryDate) > now) {
      const currentExpiry = new Date(currentAvatarFrame.expiryDate);
      newExpiryDate = new Date(currentExpiry.getTime() + reward.duration * 24 * 60 * 60 * 1000);
    }
    
    // 更新用户头像框数据
    updateUserMysteryData(coreId, {
      avatarFrame: {
        hasAvatarFrame: true,
        expiryDate: newExpiryDate.toISOString(),
        type: "mystery_shop"
      }
    });
    
    return {
      success: true,
      reward: {
        ...reward,
        expiryDate: newExpiryDate.toISOString()
      },
      message: `恭喜！您抽中了精美头像框，有效期至${newExpiryDate.toLocaleDateString()}`
    };
  }
  
  // 处理出场动画
  if (reward.type === "entrance_animation") {
    // 获取用户当前神秘商店数据
    const userMysteryData = getUserMysteryData(coreId) || {};
    const currentEntranceAnimation = userMysteryData.entranceAnimation || {};
    
    // 计算新的过期时间
    const now = new Date();
    let newExpiryDate = new Date();
    newExpiryDate.setDate(now.getDate() + reward.duration);
    
    // 如果已有出场动画且未过期，则累加天数
    if (currentEntranceAnimation.expiryDate && new Date(currentEntranceAnimation.expiryDate) > now) {
      const currentExpiry = new Date(currentEntranceAnimation.expiryDate);
      newExpiryDate = new Date(currentExpiry.getTime() + reward.duration * 24 * 60 * 60 * 1000);
    }
    
    // 更新用户出场动画数据
    updateUserMysteryData(coreId, {
      entranceAnimation: {
        hasEntranceAnimation: true,
        expiryDate: newExpiryDate.toISOString(),
        type: "mystery_shop"
      }
    });
    
    return {
      success: true,
      reward: {
        ...reward,
        expiryDate: newExpiryDate.toISOString()
      },
      message: `恭喜！您抽中了登录出场炫酷动画，有效期至${newExpiryDate.toLocaleDateString()}`
    };
  }
}

// 检查用户是否有头像框
function hasAvatarFrame(coreId) {
  if (!coreId) return false;
  
  const userMysteryData = getUserMysteryData(coreId);
  if (!userMysteryData || !userMysteryData.avatarFrame) {
    return false;
  }
  
  const now = new Date();
  const expiryDate = new Date(userMysteryData.avatarFrame.expiryDate);
  
  // 检查是否过期
  if (expiryDate <= now) {
    // 如果已过期，清除数据
    updateUserMysteryData(coreId, {
      avatarFrame: {
        hasAvatarFrame: false,
        expiryDate: null,
        type: null
      }
    });
    return false;
  }
  
  return true;
}

// 检查用户是否有出场动画
function hasEntranceAnimation(coreId) {
  if (!coreId) return false;
  
  const userMysteryData = getUserMysteryData(coreId);
  if (!userMysteryData || !userMysteryData.entranceAnimation) {
    return false;
  }
  
  const now = new Date();
  const expiryDate = new Date(userMysteryData.entranceAnimation.expiryDate);
  
  // 检查是否过期
  if (expiryDate <= now) {
    // 如果已过期，清除数据
    updateUserMysteryData(coreId, {
      entranceAnimation: {
        hasEntranceAnimation: false,
        expiryDate: null,
        type: null
      }
    });
    return false;
  }
  
  return true;
}

// 获取用户神秘商店信息
function getUserMysteryShopInfo(coreId) {
  if (!coreId) return null;
  
  const userPoints = getUserPoints(coreId);
  const hasAvatar = hasAvatarFrame(coreId);
  const hasAnimation = hasEntranceAnimation(coreId);
  const userMysteryData = getUserMysteryData(coreId) || {};
  
  return {
    coreId: coreId,
    points: userPoints,
    canDraw: userPoints >= 100,
    avatarFrame: userMysteryData.avatarFrame || null,
    entranceAnimation: userMysteryData.entranceAnimation || null,
    hasAvatarFrame: hasAvatar,
    hasEntranceAnimation: hasAnimation
  };
}

// 导出所有功能
module.exports = {
  drawMysteryReward,
  hasAvatarFrame,
  hasEntranceAnimation,
  getUserMysteryShopInfo,
  getUserMysteryData,
  updateUserMysteryData,
  MYSTERY_REWARDS
};