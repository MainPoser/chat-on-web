<template>
  <!-- 神秘老人商店弹窗 -->
  <el-popover
    placement="bottom"
    :width="400"
    trigger="click"
    popper-class="mystery-shop-popper"
  >
    <template #reference>
      <el-button class="pic-upload-btn" title="神秘老人商店">
        <el-icon><Present /></el-icon>
      </el-button>
    </template>
    
    <div class="mystery-shop-container">
      <div class="shop-header">
        <h3>神秘老人商店</h3>
      </div>
      
      <div class="shop-content">
        <div class="points-display">
          <span class="points-label">您的积分：</span>
          <span class="points-value">{{ userPoints }}</span>
        </div>
        
        <div class="mystery-item">
          <div class="item-image">
            <el-icon size="60"><Present /></el-icon>
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
.mystery-shop-container {
  padding: 15px;
  min-width: 300px;
}

.shop-header {
  text-align: center;
  margin-bottom: 15px;
}

.shop-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.points-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.points-label {
  color: #666;
}

.points-value {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
}

.mystery-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.item-image {
  margin-right: 15px;
  color: #409eff;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.item-info p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.item-cost {
  color: #f56c6c;
  font-size: 14px;
}

.shop-footer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>

<style>
.mystery-shop-popper {
  padding: 0 !important;
}
</style>