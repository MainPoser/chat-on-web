<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="card user-card">
      <div class="user-info">
        <div class="user-avatar">
          <el-avatar :size="60" :src="userAvatar" :class="{ 'avatar-frame': mysteryShopInfo?.hasAvatarFrame }">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span v-if="mysteryShopInfo?.hasAvatarFrame" class="vip-crown">👑</span>
          <div class="status-indicator online"></div>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ username }}</h2>
          <p class="user-id">ID: {{ userId }}</p>
        </div>
      </div>
    </div>

    <!-- 积分卡片 -->
    <div class="card points-card">
      <div class="card-header">
        <h3 class="card-title">
          <el-icon><Coin /></el-icon>
          我的积分
        </h3>
        <el-button 
          type="primary" 
          size="default"
          :disabled="!canClaimDaily" 
          @click="claimDailyPoints"
          :loading="claiming"
          class="claim-btn"
        >
          {{ canClaimDaily ? "每日领取" : "已领取" }}
        </el-button>
      </div>
      
      <div class="points-content">
        <div class="points-main">
          <div class="points-value">{{ userPoints }}</div>
          <div class="points-label">积分（下一等级: {{ Math.ceil(userPoints / 100) * 100 }}）</div>
        </div>
        
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${Math.min(userPoints / 10, 100)}%` }"></div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatTimeToHMS(dynamicOnlineMinutes) }}</div>
              <div class="stat-label">在线时长</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatTime(lastClaimDate) }}</div>
              <div class="stat-label">上次领取</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 宠物设置卡片 -->
    <div class="card pet-card">
      <div class="card-header">
        <h3 class="card-title">
          <el-icon><Star /></el-icon>
          宠物设置
        </h3>
      </div>
      
      <div class="pet-content">
        <div class="pet-setting-item">
          <div class="setting-info">
            <h4>启用宠物</h4>
            <p>开启后，宠物将出现在页面右下角</p>
          </div>
          <el-switch 
            v-model="petEnabled" 
            @change="handlePetToggle"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </div>
        
        <div class="pet-setting-item" v-if="petEnabled">
          <div class="setting-info">
            <h4>宠物样式</h4>
            <p>选择您喜欢的宠物样式</p>
          </div>
          <div class="pet-style-selector">
            <div 
              v-for="(pet, index) in petStyles" 
              :key="index"
              class="pet-style-option"
              :class="{ active: selectedPetStyle === index }"
              @click="selectPetStyle(index)"
            >
              <img :src="pet.image" :alt="pet.name" class="pet-thumbnail">
              <span class="pet-name">{{ pet.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则卡片 -->
    <div class="card rules-card">
      <div class="card-header">
        <h3 class="card-title">
          <el-icon><InfoFilled /></el-icon>
          积分规则
        </h3>
      </div>
      
      <div class="rules-content">
        <div class="rules-grid">
          <div class="rule-item">
            <div class="rule-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="rule-text">
              <h4>在线奖励</h4>
              <p>每在线1小时获得10积分</p>
            </div>
          </div>
          
          <div class="rule-item">
            <div class="rule-icon">
              <el-icon><Present /></el-icon>
            </div>
            <div class="rule-text">
              <h4>每日签到</h4>
              <p>每日登录可领取100积分</p>
            </div>
          </div>
          
          <div class="rule-item">
            <div class="rule-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="rule-text">
              <h4>宠物互动</h4>
              <p>与宠物互动可获得50-100积分，每日限10次</p>
            </div>
          </div>
          
          <div class="rule-item">
            <div class="rule-icon">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="rule-text">
              <h4>积分用途</h4>
              <p>积分可用于解锁特殊功能</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { User, Coin, Clock, Calendar, InfoFilled, Timer, Present, Star } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import pet1Image from '../assets/pats/QQ1.gif';
import pet2Image from '../assets/pats/Q2.gif';

// 用户信息
const username = ref('');
const userId = ref('');
const coreId = ref('');
const userAvatar = ref('');

// 积分信息
const userPoints = ref(0);
const onlineMinutes = ref(0);
const canClaimDaily = ref(false);
const lastClaimDate = ref('');
const claiming = ref(false);

// 宠物设置
const petEnabled = ref(false);
const selectedPetStyle = ref(0);
const petStyles = ref([
  { 
    name: '小白', 
    image: pet1Image,
    description: '可爱的小白狗'
  },
  { 
    name: 'Q版宠物', 
    image: pet2Image,
    description: 'Q版萌宠'
  }
]);

// 神秘老人商店信息
const mysteryShopInfo = ref({
  hasAvatarFrame: false,
  hasEntranceAnimation: false,
  avatarFrameDays: 0,
  entranceAnimationDays: 0
});

// 在线时长相关
const sessionStartTime = ref(Date.now()); // 记录会话开始时间
const timer = ref(null); // 计时器引用
const currentTime = ref(Date.now()); // 当前时间，用于触发计算属性更新

// 计算动态在线时长（会话时长 + 历史时长）
const dynamicOnlineMinutes = computed(() => {
  const sessionMinutes = (currentTime.value - sessionStartTime.value) / (1000 * 60); // 会话时长（分钟）
  return onlineMinutes.value + sessionMinutes;
});

// 格式化时间为HH:mm:ss
function formatTimeToHMS(totalMinutes) {
  const totalSeconds = Math.floor(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 从localStorage获取用户信息
function getUserInfo() {
  username.value = localStorage.getItem('username') || '';
  userId.value = localStorage.getItem('userId') || '';
  coreId.value = localStorage.getItem('coreId') || '';
  
  // 从localStorage获取上次领取时间
  const storedLastClaimDate = localStorage.getItem('lastClaimDate');
  if (storedLastClaimDate) {
    lastClaimDate.value = storedLastClaimDate;
  }
  
  // 从localStorage获取canClaimDaily状态
  const storedCanClaimDaily = localStorage.getItem('canClaimDaily');
  if (storedCanClaimDaily !== null) {
    canClaimDaily.value = storedCanClaimDaily === 'true';
  }
  
  // 从localStorage获取宠物设置
  const storedPetEnabled = localStorage.getItem('petEnabled');
  if (storedPetEnabled !== null) {
    petEnabled.value = storedPetEnabled === 'true';
  }
  
  const storedPetStyle = localStorage.getItem('selectedPetStyle');
  if (storedPetStyle !== null) {
    selectedPetStyle.value = parseInt(storedPetStyle, 10);
  }
}

// 处理宠物开关切换
function handlePetToggle(value) {
  localStorage.setItem('petEnabled', value.toString());
  
  // 触发全局事件，通知其他组件宠物状态变化
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('petToggle', { detail: { enabled: value } }));
  }
}

// 选择宠物样式
function selectPetStyle(index) {
  selectedPetStyle.value = index;
  localStorage.setItem('selectedPetStyle', index.toString());
  
  // 触发全局事件，通知其他组件宠物样式变化
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('petStyleChange', { 
      detail: { 
        styleIndex: index,
        petStyle: petStyles.value[index]
      } 
    }));
  }
}

function formatTime(time){
  return time?dayjs(time).format('YYYY-MM-DD HH:mm:ss'):'未领取'
}

// 格式化分钟数
function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  }
}

// 领取每日积分
function claimDailyPoints() {
  if (!canClaimDaily.value) return;
  
  claiming.value = true;
  
  // 发送领取积分请求
  if (window.socket) {
    window.socket.emit('claim_daily_points');
  }
  
  // 监听领取结果
  const handleClaimSuccess = (data) => {
    userPoints.value = data.points;
    canClaimDaily.value = data.canClaimDaily;
    // 保存canClaimDaily状态到localStorage
    localStorage.setItem('canClaimDaily', data.canClaimDaily.toString());
    lastClaimDate.value = new Date().toISOString();
    // 保存到localStorage
    localStorage.setItem('lastClaimDate', lastClaimDate.value);
    ElMessage.success(`成功领取${data.claimedPoints}积分！`);
    claiming.value = false;
    
    // 移除事件监听
    if (window.socket) {
      window.socket.off('claim_points_success', handleClaimSuccess);
      window.socket.off('claim_points_failed', handleClaimFailed);
    }
  };
  
  const handleClaimFailed = (data) => {
    ElMessage.error(data.message || '领取失败');
    claiming.value = false;
    
    // 移除事件监听
    if (window.socket) {
      window.socket.off('claim_points_success', handleClaimSuccess);
      window.socket.off('claim_points_failed', handleClaimFailed);
    }
  };
  
  if (window.socket) {
    window.socket.on('claim_points_success', handleClaimSuccess);
    window.socket.on('claim_points_failed', handleClaimFailed);
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo();
  
  // 设置定时器，每秒更新一次在线时长显示
  timer.value = setInterval(() => {
    // 更新当前时间，触发计算属性重新计算
    currentTime.value = Date.now();
  }, 1000);
  
  // 监听积分更新
  if (window.socket) {
    window.socket.on('points_updated', (data) => {
      // 只有当更新的是当前用户的积分时才更新
      if (data.coreId === coreId.value) {
        userPoints.value = data.points;
        onlineMinutes.value = data.onlineMinutes || 0;
        console.log(`Profile页面更新用户积分: ${data.points}`);
        
        // 只有在明确提供了canClaimDaily状态时才更新，否则保持当前状态
        if (data.canClaimDaily !== undefined) {
          canClaimDaily.value = data.canClaimDaily;
          // 保存canClaimDaily状态到localStorage
          localStorage.setItem('canClaimDaily', data.canClaimDaily.toString());
        }
        // 如果没有提供lastClaimDate，但canClaimDaily为false，说明已经领取过
        if (!data.lastClaimDate && !canClaimDaily.value) {
          lastClaimDate.value = new Date().toISOString();
          // 保存到localStorage
          localStorage.setItem('lastClaimDate', lastClaimDate.value);
        } else if (data.lastClaimDate) {
          lastClaimDate.value = data.lastClaimDate;
          // 保存到localStorage
          localStorage.setItem('lastClaimDate', data.lastClaimDate);
        }
      }
    });
    
    // 监听积分信息
  window.socket.on('points_info', (data) => {
    userPoints.value = data.points;
    onlineMinutes.value = data.onlineMinutes || 0;
    canClaimDaily.value = data.canClaimDaily;
    lastClaimDate.value = data.lastClaimDate || '';
    
    // 将上次领取时间保存到localStorage
    if (data.lastClaimDate) {
      localStorage.setItem('lastClaimDate', data.lastClaimDate);
    }
    
    // 保存canClaimDaily状态到localStorage
    localStorage.setItem('canClaimDaily', data.canClaimDaily.toString());
  });
  
  // 监听神秘商店信息
  window.socket.on('mystery_shop_info', (data) => {
    console.log("Profile页面收到神秘商店信息:", data);
    mysteryShopInfo.value = data;
  });

  // 监听获取神秘商店信息成功事件
  window.socket.on('get_mystery_shop_info_success', (data) => {
    console.log("Profile页面获取神秘商店信息成功:", data);
    mysteryShopInfo.value = data;
  });

  // 监听神秘老人商店信息更新事件
  window.socket.on('mystery_shop_updated', (data) => {
    console.log("Profile页面神秘老人商店信息更新:", data);
    mysteryShopInfo.value = data;
  });
  
  // 请求当前积分信息
  window.socket.emit('get_points');
  
  // 请求神秘商店信息
  window.socket.emit('get_mystery_shop_info');
  }
  
  // 如果socket还未连接，添加一个延迟重试机制
  if (!window.socket || !window.socket.connected) {
    setTimeout(() => {
      if (window.socket && window.socket.connected) {
        window.socket.emit('get_points');
        window.socket.emit('get_mystery_shop_info');
      }
    }, 1000);
  }
  
  // 添加一个额外的重试机制，确保在页面加载后获取到积分信息
  setTimeout(() => {
    if (window.socket && window.socket.connected) {
      window.socket.emit('get_points');
      window.socket.emit('get_mystery_shop_info');
    }
  }, 2000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: calc(100vh - 64px); /* 减去可能的导航栏高度 */
  align-items: center;
}

/* 现代卡片样式 */
.card {
  width: 100%;
  max-width: 800px;
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  transform: translateY(-5px);
}

/* 用户卡片 */
.user-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 20px;
}

.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: left;
  gap: 20px;
  width: 100%;
  max-width: 500px;
}

.user-avatar {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar .el-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 头像框样式 */
.user-avatar .avatar-frame {
  position: relative;
  border: none !important;
  padding: 4px;
  background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FF8C00, #FFD700);
  background-size: 300% 300%;
  animation: avatar-frame-gradient 3s ease infinite;
  box-shadow: 
    0 0 0 2px rgba(255, 215, 0, 0.3),
    0 0 15px rgba(255, 215, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.3) !important;
  border-radius: 50%;
}

/* 头像框内部装饰 */
.user-avatar .avatar-frame::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700, #FF8C00, #FFD700);
  background-size: 300% 300%;
  border-radius: 50%;
  z-index: -1;
  opacity: 0.8;
  animation: avatar-frame-gradient 4s ease infinite reverse;
}

/* 头像框外部光晕 */
.user-avatar .avatar-frame::after {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 70%);
  border-radius: 50%;
  z-index: -2;
  animation: avatar-frame-pulse 2s ease-in-out infinite;
}

/* VIP王冠样式 */
.user-avatar .vip-crown {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 24px;
  color: #FFD700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.6);
  animation: vip-crown-bounce 2s infinite;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0) 70%);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 王冠装饰光点 */
.user-avatar .vip-crown::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 6px;
  height: 6px;
  background: #FFF;
  border-radius: 50%;
  animation: vip-crown-sparkle 1.5s infinite;
}

/* 暗黑模式下的VIP王冠样式 */
.dark .user-avatar .vip-crown {
  color: #FFD700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.9),
    0 0 25px rgba(255, 215, 0, 0.7);
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.9));
}

@keyframes avatar-frame-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes avatar-frame-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes avatar-frame-glow {
  0% {
    box-shadow: 
      0 0 0 2px rgba(255, 215, 0, 0.3),
      0 0 15px rgba(255, 215, 0, 0.5),
      0 0 30px rgba(255, 215, 0, 0.3);
  }
  100% {
    box-shadow: 
      0 0 0 2px rgba(255, 215, 0, 0.5),
      0 0 20px rgba(255, 215, 0, 0.7),
      0 0 40px rgba(255, 215, 0, 0.5);
  }
}

@keyframes vip-crown-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.1);
  }
}

@keyframes vip-crown-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes vip-crown-sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-indicator.online {
  background-color: #52c41a;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.user-id {
  margin: 0;
  font-size: 16px;
  color: #8c8c8c;
  font-weight: 500;
}

/* 积分卡片 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.claim-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 24px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.2s ease;
}

.claim-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.points-content {
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.points-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.points-value {
  font-size: 56px;
  font-weight: 800;
  color: #1890ff;
  line-height: 1;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.points-label {
  font-size: 18px;
  color: #8c8c8c;
  font-weight: 500;
}

.progress-section {
  width: 100%;
  max-width: 500px;
}

.progress-bar {
  height: 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  font-size: 14px;
  color: #8c8c8c;
  text-align: center;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(54, 207, 201, 0.15));
  color: #1890ff;
  margin-right: 16px;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
  font-weight: 500;
}

/* 规则卡片 */
.rules-content {
  padding: 0 32px 32px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 700px;
}

/* 自定义滚动条样式 */
.rules-content::-webkit-scrollbar {
  width: 8px;
}

.rules-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.rules-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.rules-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.rule-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.rule-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.rule-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(54, 207, 201, 0.15));
  color: #1890ff;
  margin-bottom: 16px;
  font-size: 28px;
}

.rule-text h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.rule-text p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1.5;
  font-weight: 500;
}

/* 宠物设置卡片样式 */
.pet-content {
  padding: 0 32px 32px;
}

.pet-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.pet-setting-item:last-child {
  border-bottom: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.setting-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.setting-info p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1.5;
}

.pet-style-selector {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

.pet-style-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  width: 120px;
}

.pet-style-option:hover {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.15);
}

.pet-style-option.active {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.pet-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
  border-radius: 8px;
}

.pet-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-page {
    padding: 24px;
    gap: 24px;
  }
  
  .card {
    max-width: 100%;
  }
  
  .card-header {
    padding: 20px 24px 16px;
  }
  
  .points-content,
  .rules-content,
  .pet-content {
    padding: 0 24px 24px;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 20px;
    gap: 20px;
  }
  
  .user-card {
    padding: 30px 20px;
  }
  
  .user-name {
    font-size: 24px;
  }
  
  .card-header {
    padding: 16px 20px 12px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .points-content,
  .rules-content,
  .pet-content {
    padding: 0 20px 20px;
  }
  
  .points-value {
    font-size: 48px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .rules-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-item,
  .rule-item {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 16px;
    gap: 16px;
  }
  
  .user-card {
    padding: 20px 16px;
  }
  
  .user-name {
    font-size: 22px;
  }
  
  .card-header {
    padding: 14px 16px 10px;
  }
  
  .points-content,
  .rules-content,
  .pet-content {
    padding: 0 16px 16px;
  }
  
  .points-value {
    font-size: 40px;
  }
  
  .points-label {
    font-size: 16px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .stat-item,
  .rule-item {
    padding: 14px;
  }
  
  .stat-icon,
  .rule-icon {
    width: 45px;
    height: 45px;
    font-size: 22px;
  }
  
  .rule-icon {
    margin-bottom: 12px;
  }
  
  .stat-value {
    font-size: 15px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .rule-text h4 {
    font-size: 16px;
  }
  
  .rule-text p {
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .profile-page {
    padding: 12px;
    gap: 12px;
  }
  
  .user-card {
    padding: 16px 12px;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .card-header {
    padding: 12px 14px 8px;
  }
  
  .points-content,
  .rules-content,
  .pet-content {
    padding: 0 14px 14px;
  }
  
  .points-value {
    font-size: 36px;
  }
  
  .points-label {
    font-size: 15px;
  }
  
  .card-title {
    font-size: 17px;
  }
  
  .stat-item,
  .rule-item {
    padding: 12px;
  }
  
  .stat-icon,
  .rule-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .rule-icon {
    margin-bottom: 10px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .rule-text h4 {
    font-size: 15px;
  }
  
  .rule-text p {
    font-size: 12px;
  }
  
  .user-id {
    font-size: 14px;
  }
}
</style>
