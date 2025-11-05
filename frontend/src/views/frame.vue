<template>
  <div class="frame-container">
    <div class="frame-header">
      <div class="frame-title">
        <el-icon><Monitor /></el-icon>
        <span>{{ currentFrameTitle }}</span>
      </div>
      <div class="frame-controls">
        <el-button 
          v-if="currentFrameUrl" 
          type="primary" 
          size="small" 
          @click="refreshFrame"
          :loading="refreshing"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button 
          v-if="currentFrameUrl" 
          size="small" 
          @click="openInNewTab"
        >
          <el-icon><Link /></el-icon>
          新窗口打开
        </el-button>
      </div>
    </div>
    
    <div class="frame-content">
      <div v-if="!currentFrameUrl" class="empty-state">
        <el-icon class="empty-icon"><Monitor /></el-icon>
        <p>请先在设置页面配置网站链接</p>
        <el-button type="primary" @click="goToSettings">
          <el-icon><Setting /></el-icon>
          前往设置
        </el-button>
      </div>
      
      <iframe 
        v-else
        ref="frameRef"
        :src="currentFrameUrl" 
        frameborder="0"
        width="100%"
        height="100%"
        @load="onFrameLoad"
        class="frame-iframe"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Monitor, Refresh, Link, Setting } from '@element-plus/icons-vue';

const frameRef = ref(null);
const refreshing = ref(false);
const frameSites = ref([]);

// 从localStorage获取配置的网站列表
const loadFrameSites = () => {
  const savedSites = localStorage.getItem('frameSites');
  if (savedSites) {
    try {
      frameSites.value = JSON.parse(savedSites);
    } catch (e) {
      console.error('解析frameSites配置失败:', e);
      frameSites.value = [];
    }
  } else {
    // 默认配置，包含内置的cf-tools
    frameSites.value = [
      { name: "cf-tools", url: "https://cf-tools.tianyao.qzz.io/" }
    ];
  }
};

// 获取当前选中的网站
const currentSite = computed(() => {
  const selectedName = localStorage.getItem('selectedFrameSite') || 'cf-tools';
  return frameSites.value.find(site => site.name === selectedName) || frameSites.value[0];
});

// 当前网站标题
const currentFrameTitle = computed(() => {
  return currentSite.value ? currentSite.value.name : '未选择网站';
});

// 当前网站URL
const currentFrameUrl = computed(() => {
  return currentSite.value ? currentSite.value.url : '';
});

// 刷新iframe
const refreshFrame = () => {
  if (frameRef.value) {
    refreshing.value = true;
    // 强制刷新iframe
    const currentSrc = frameRef.value.src;
    frameRef.value.src = '';
    setTimeout(() => {
      frameRef.value.src = currentSrc;
      refreshing.value = false;
    }, 100);
  }
};

// 在新窗口打开
const openInNewTab = () => {
  if (currentFrameUrl.value) {
    window.open(currentFrameUrl.value, '_blank');
  }
};

// iframe加载完成
const onFrameLoad = () => {
  refreshing.value = false;
};

// 前往设置页面
const goToSettings = () => {
  window.location.href = '#/settings';
};

// 监听localStorage变化，实时更新iframe
const updateFrameFromStorage = () => {
  loadFrameSites();
};

// 监听storage事件，当其他页面更新配置时同步
window.addEventListener('storage', (e) => {
  if (e.key === 'frameSites' || e.key === 'selectedFrameSite') {
    updateFrameFromStorage();
  }
});

// 监听自定义事件，当设置页面更新配置时同步
window.addEventListener('frame-sites-changed', (e) => {
  loadFrameSites();
});

onMounted(() => {
  loadFrameSites();
});
</script>

<style scoped>
.frame-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background-primary);
  color: var(--text-primary);
}

.frame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--background-secondary);
  border-bottom: 1px solid var(--border-color);
}

.frame-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.frame-controls {
  display: flex;
  gap: 8px;
}

.frame-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.frame-iframe {
  border: none;
  width: 100%;
  height: 100%;
}
</style>