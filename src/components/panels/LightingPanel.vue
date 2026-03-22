<script setup lang="ts">
import { ref, watch } from 'vue'
import { RotateCw, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, ChevronUp } from 'lucide-vue-next'
import LightingScene from '../multiAngles/LightingScene.vue'

const props = defineProps<{
  imageUrl?: string
}>()

const activeTab = ref('perspective')
const brightness = ref(50)
const colorTemp = ref(5600)
const lightDirection = ref('front')
const rimLight = ref(true)
const rimIntensity = ref(20)

const lightDirections = [
  { value: 'left', label: '左侧', icon: ArrowLeft },
  { value: 'top', label: '顶部', icon: ArrowUp },
  { value: 'right', label: '右侧', icon: ArrowRight },
  { value: 'front', label: '前方', icon: Circle },
  { value: 'bottom', label: '底部', icon: ArrowDown },
  { value: 'back', label: '后方', icon: Circle },
]

// 监听亮度变化，四舍五入到最近的三个固定值
watch(brightness, (newVal) => {
  const options = [10, 50, 100]
  const closest = options.reduce((prev, curr) => {
    return Math.abs(curr - newVal) < Math.abs(prev - newVal) ? curr : prev
  })
  if (newVal !== closest) {
    brightness.value = closest
  }
})

// 监听色温变化，吸附到固定值
watch(colorTemp, (newVal) => {
  const options = [2000, 3000, 4000, 5600, 7000, 8000]
  const closest = options.reduce((prev, curr) => {
    return Math.abs(curr - newVal) < Math.abs(prev - newVal) ? curr : prev
  })
  if (newVal !== closest) {
    colorTemp.value = closest
  }
})

const resetLight = () => {
  brightness.value = 50
  colorTemp.value = 5600
  lightDirection.value = 'front'
  rimLight.value = false
  rimIntensity.value = 20
}

const increaseRimIntensity = () => {
  rimIntensity.value = Math.min(100, rimIntensity.value + 5)
}
</script>

<template>
  <div class="lighting-panel" @mousedown.stop @wheel.stop @touchstart.stop>
    <!-- 标签页 -->
    <div class="tabs" @mousedown.stop @touchstart.stop style="display: none;">
      <button
        class="tab"
        :class="{ active: activeTab === 'perspective' }"
        @click.stop="activeTab = 'perspective'"
      >
        透视
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'front' }"
        @click.stop="activeTab = 'front'"
      >
        正面
      </button>
    </div>

    <div class="panel-content">
      <!-- 左侧光源可视化区 -->
      <div class="light-visualizer">
        <!-- 浮动视图切换按钮 -->
        <div class="view-toggle-float">
          <button
            class="view-toggle-btn"
            :class="{ active: activeTab === 'perspective' }"
            @click.stop="activeTab = 'perspective'"
            title="透视视图"
          >
            透视
          </button>
          <button
            class="view-toggle-btn"
            :class="{ active: activeTab === 'front' }"
            @click.stop="activeTab = 'front'"
            title="正面视图"
          >
            正面
          </button>
        </div>
        <div class="scene-wrapper">
          <LightingScene
            :image-url="props.imageUrl"
            :brightness="brightness"
            :color-temp="colorTemp"
            :light-direction="lightDirection"
          />
        </div>
        <div class="light-label" @mousedown.stop @touchstart.stop>
          <span>主光源</span>
          <button class="reset-light-btn" @click.stop="resetLight">
            <RotateCw size="12" />
            重置
          </button>
        </div>
      </div>

      <!-- 右侧参数区 -->
      <div class="params-section" @mousedown.stop @touchstart.stop>
        <!-- 全局 -->
        <div class="param-group">
          <h4 class="group-title">全局</h4>
          <div class="param-item">
            <div class="param-header">
              <span class="param-label">亮度</span>
              <span class="param-value">{{ brightness }}%</span>
            </div>
            <input
              type="range"
              v-model="brightness"
              min="10"
              max="100"
              step="1"
              class="slider"
              @mousedown.stop
              @touchstart.stop
            />
          </div>
          <div class="param-item">
            <div class="param-header">
              <span class="param-label">色温</span>
              <span class="param-value">{{ colorTemp }} K</span>
            </div>
            <input
              type="range"
              v-model="colorTemp"
              min="2000"
              max="8000"
              class="slider"
              data-type="color-temp"
              @mousedown.stop
              @touchstart.stop
            />
          </div>
        </div>

        <!-- 主光源 -->
        <div class="param-group">
          <h1 class="group-title">主光源</h1>
          <div class="direction-grid">
            <button
              v-for="dir in lightDirections"
              :key="dir.value"
              class="direction-btn"
              :class="{ active: lightDirection === dir.value }"
              @click.stop="lightDirection = dir.value"
            >

              <span>{{ dir.label }}</span>
            </button>
          </div>
        </div>

        <!-- 轮廓光 -->
        <div class="param-group">

          <div class="rim-light-item">
            <div class="param-header">
              <h4 class="group-title">轮廓光</h4>
              <div class="toggle" :class="{ active: rimLight }" @click.stop="rimLight = !rimLight">
                <div class="toggle-thumb"></div>
              </div>
            </div>
            <div class="price-button-wrapper mt-4 self-end">
              <div
                  class="price-button flex items-center gap-1 rounded-full p-1 border border-white/10 justify-between"
                  @click="handleApply"
                  style="width: 69px; backdrop-filter: blur(10px); background: radial-gradient(94.74% 157.5% at 50% 21.25%, rgb(26, 26, 26) 0%, rgb(101, 103, 102) 100%);"
              >
                <div class="flex items-center text-sm text-popover-foreground font-medium box-border pl-1">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="stroke: rgb(204, 204, 204);">
                    <path d="M11.2077 11.0832C13.7219 11.0832 15.7601 9.04507 15.7601 6.53088C15.7601 4.01668 13.7219 1.97852 11.2077 1.97852C8.6935 1.97852 6.65533 4.01668 6.65533 6.53088C6.65533 9.04507 8.6935 11.0832 11.2077 11.0832Z" stroke-width="2"></path>
                    <path d="M2.05883 7.07063C2.40649 5.06634 4.30083 3.70985 6.31403 4.03225C8.31238 4.35169 9.68225 6.2074 9.41481 8.20129C9.41481 8.34911 9.51357 8.81255 9.57973 9.03629C9.77436 9.69448 10.1844 10.6335 11.015 11.721C12.2615 13.3554 11.948 15.691 10.3152 16.9375C8.68085 18.1841 6.34524 17.8721 5.09869 16.2378C2.41541 12.7239 1.71413 9.22201 2.0514 7.11817L2.05883 7.07063Z" stroke-width="2"></path>
                    <path d="M8.52786 8.98262L7.26662 12.7829C6.82516 14.1131 7.54561 15.5493 8.87578 15.9907L12.6761 17.252C14.0062 17.6934 15.4424 16.973 15.8839 15.6428L17.1451 11.8425C17.5866 10.5124 16.8662 9.07616 15.536 8.6347L11.7357 7.37346C10.4055 6.932 8.96932 7.65244 8.52786 8.98262Z" stroke-width="2"></path>
                  </svg>
                  <span class="relative inline-flex min-w-6 justify-center tabular-nums text-[12px]">
                      <span class="inline-flex w-full justify-center whitespace-nowrap tap-price-change">10</span>
                    </span>
                </div>
                <button
                    type="button"
                    class="aspect-square w-6.5 h-6.5 rounded-full cursor-pointer flex items-center justify-center bg-white text-black hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    aria-label="Generate"
                    data-testid="canvas-node-generate-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up" aria-hidden="true">
                    <path d="m5 12 7-7 7 7"></path>
                    <path d="M12 19V5"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lighting-panel {
  width: 500px;
  background: #1e1e20;
  border-radius: 8px;
  padding: 6px 10px 0px 0px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid #2a2a2a;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 6px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #4a4a4f;
  color: #fff;
  border-color: #4a4a4f;
}

.tab:hover:not(.active) {
  background: #2a2a2d;
}

.panel-content {
  display: flex;
  gap: 2px;
  align-items: flex-start;
}

.light-visualizer {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  align-items: center;

  min-height: 280px;
  pointer-events: none;
  position: relative;
}

.view-toggle-float {
  position: absolute;
  top: 3px;
  left: 107px;
  display: flex;
  pointer-events: auto;
  z-index: 10;
}

.view-toggle-btn {
  padding: 2px 3px;
  font-size: 11px;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid #444;
  border-radius: 4px;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.view-toggle-btn:hover {
  background: rgba(42, 42, 42, 0.95);
  color: #fff;
}

.view-toggle-btn.active {
  background: rgba(74, 74, 79, 0.95);
  color: #fff;
  border-color: #555;
}

.scene-wrapper {
  pointer-events: auto;
}

.light-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.light-label span {
  font-size: 12px;
  color: #a0a0a0;
  font-weight: 500;
}

.reset-light-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #666;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-light-btn:hover {
  background: #2a2a2a;
  color: #fff;
}

.params-section {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.param-label {
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b3;
}

.param-value {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #3a3a3c;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

/* 色温滑块渐变背景 */
.slider[data-type="color-temp"] {
  background: linear-gradient(to right, #ff9e4d, #87ceeb);
}

.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.direction-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 1px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #a0a0a0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.direction-btn:hover {
  background: #2a2a2d;
}

.direction-btn.active {
  background: #3a3a3c;
  color: #fff;
  border-color: #3a3a3c;
  box-shadow: inset 0 0 0 1px #4a4a4f;
}

.toggle {
  width: 44px;
  height: 24px;
  background: #3a3a3c;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #666;
  border-radius: 50%;
  transition: transform 0.3s, background 0.3s;
}

.toggle.active {
  background: #4a90e2;
}

.toggle.active .toggle-thumb {
  transform: translateX(20px);
  background: #fff;
}

.rim-light-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

</style>
