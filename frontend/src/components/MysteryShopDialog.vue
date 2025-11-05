<template>
  <!-- 神秘老人商店弹窗 -->
  <el-popover
    placement="bottom"
    :width="420"
    trigger="click"
    popper-class="mystery-shop-popper"
  >
    <template #reference>
      <el-button class="mystery-shop-btn" title="神秘商店">
        <div class="old-man-icon">
          <div class="old-man-face">
            <div class="old-man-beard"></div>
            <div class="old-man-eyes"></div>
            <div class="old-man-hat"></div>
          </div>
        </div>
      </el-button>
    </template>
    
    <div class="mystery-shop-container">
      <div class="shop-header">
        <h3>✨ 神秘商店 ✨</h3>
      </div>
      
      <div class="shop-content">
        <div class="points-display">
          <span class="points-label">您的积分：</span>
          <span class="points-value">{{ userPoints }}</span>
        </div>
        
        <div class="mystery-item">
          <div class="item-image">
            <div class="mystery-box">
              <div class="box-lid"></div>
              <div class="box-body"></div>
              <div class="mystery-glow"></div>
            </div>
          </div>
          <div class="item-info">
            <h4>神秘礼包</h4>
            <p>花费100积分，随机获得奖励</p>
            <div class="item-cost">消耗：100 积分</div>
          </div>
        </div>
        
        <div class="shop-footer">
          <el-button 
            type="primary" 
            class="draw-button"
            @click="drawReward"
            :disabled="isDrawing || userPoints < 100"
          >
            {{ isDrawing ? '抽奖中...' : '抽取奖励' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Present } from '@element-plus/icons-vue';

// 定义props
const props = defineProps({
  userPoints: {
    type: Number,
    default: 0
  },
  mysteryShopInfo: {
    type: Object,
    default: () => ({
      hasAvatarFrame: false,
      hasEntranceAnimation: false,
      avatarFrameDays: 0,
      entranceAnimationDays: 0
    })
  }
});

// 定义emits
const emit = defineEmits(['draw-reward']);

// 状态
const isDrawing = ref(false);

// 监听父组件发送的重置状态事件
const resetDrawingState = () => {
  isDrawing.value = false;
};

const drawReward = () => {
  if (props.userPoints < 100) {
    ElMessage.error('积分不足，需要100积分才能抽取神秘礼物！');
    return;
  }
  
  isDrawing.value = true;
  
  // 发送抽取请求到父组件
  emit('draw-reward');
  
  // 不再自动关闭对话框，等待抽奖结果返回后再关闭
  // 对话框将在收到抽奖结果后由父组件控制关闭
};

// 暴露方法给父组件
defineExpose({
  resetDrawingState
});
</script>

<style scoped>
/* 神秘老人商店按钮样式 */
.mystery-shop-btn {
  background: linear-gradient(135deg, #6a5acd, #4b0082);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(75, 0, 130, 0.3);
  margin-left: 10px;
}

.mystery-shop-btn:hover {
  background: linear-gradient(135deg, #7b68ee, #5a2d8c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 0, 130, 0.4);
}

/* 老人图标样式 */
.old-man-icon {
  width: 24px;
  height: 24px;
  position: relative;
}

.old-man-face {
  width: 20px;
  height: 20px;
  background-color: #fdbcb4;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
}

.old-man-beard {
  width: 18px;
  height: 10px;
  background-color: #f5f5f5;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  left: 1px;
}

.old-man-eyes {
  position: absolute;
  top: 6px;
  left: 4px;
  width: 12px;
  display: flex;
  justify-content: space-between;
}

.old-man-eyes::before,
.old-man-eyes::after {
  content: '';
  width: 3px;
  height: 3px;
  background-color: #333;
  border-radius: 50%;
}

.old-man-hat {
  width: 16px;
  height: 8px;
  background-color: #4b0082;
  border-radius: 50% 50% 0 0;
  position: absolute;
  top: -5px;
  left: 2px;
}

.old-man-hat::after {
  content: '';
  width: 6px;
  height: 6px;
  background-color: #ffd700;
  border-radius: 50%;
  position: absolute;
  top: -2px;
  left: 5px;
}

/* 神秘商店弹窗样式 */
.mystery-shop-container {
  padding: 20px;
  min-width: 350px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.mystery-shop-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6a5acd, #9370db, #6a5acd);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.shop-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.shop-header h3 {
  margin: 0;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(147, 112, 219, 0.8);
}

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.points-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.points-label {
  color: #d1c4e9;
  font-weight: 500;
}

.points-value {
  font-weight: bold;
  color: #ffd700;
  font-size: 18px;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.mystery-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.mystery-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.item-image {
  margin-right: 15px;
  position: relative;
}

/* 神秘盒子样式 */
.mystery-box {
  width: 60px;
  height: 60px;
  position: relative;
}

.box-body {
  width: 50px;
  height: 40px;
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  border-radius: 5px;
  position: absolute;
  bottom: 0;
  left: 5px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

.box-lid {
  width: 60px;
  height: 20px;
  background: linear-gradient(135deg, #ba68c8, #9575cd);
  border-radius: 5px 5px 0 0;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: bottom;
  animation: lidFloat 3s infinite alternate ease-in-out;
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.2);
}

@keyframes lidFloat {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(-15deg); }
}

.mystery-glow {
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 215, 0, 0) 70%);
  border-radius: 50%;
  position: absolute;
  top: -5px;
  left: -5px;
  animation: glowPulse 2s infinite alternate;
}

@keyframes glowPulse {
  0% { opacity: 0.3; transform: scale(0.9); }
  100% { opacity: 0.7; transform: scale(1.1); }
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.item-info p {
  margin: 0 0 8px 0;
  color: #d1c4e9;
  font-size: 14px;
}

.item-cost {
  color: #ff9800;
  font-size: 14px;
  font-weight: bold;
}

.shop-footer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.draw-button {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
  transition: all 0.3s ease;
}

.draw-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ab47bc, #7e57c2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.5);
}

.draw-button:disabled {
  background: linear-gradient(135deg, #5e35b1, #4527a0);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

<style>
.mystery-shop-popper {
  padding: 0 !important;
}
</style>