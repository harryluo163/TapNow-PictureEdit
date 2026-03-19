<script setup lang="ts">
import { ref } from 'vue'
import { RotateCw, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, ChevronUp } from 'lucide-vue-next'

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
  <div class="lighting-panel">
    <!-- 标签页 -->
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'perspective' }"
        @click="activeTab = 'perspective'"
      >
        透视
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'front' }"
        @click="activeTab = 'front'"
      >
        正面
      </button>
    </div>

    <div class="panel-content">
      <!-- 左侧光源可视化区 -->
      <div class="light-visualizer">
        <div class="light-circle">
          <div class="light-source"></div>
          <div class="light-cone"></div>
        </div>
        <div class="light-label">
          <span>主光源</span>
          <button class="reset-light-btn" @click="resetLight">
            <RotateCw size="12" />
            重置
          </button>
        </div>
      </div>

      <!-- 右侧参数区 -->
      <div class="params-section">
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
              min="0" 
              max="100" 
              class="slider"
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
              min="2700" 
              max="6500" 
              class="slider"
            />
          </div>
        </div>

        <!-- 主光源 -->
        <div class="param-group">
          <h4 class="group-title">主光源</h4>
          <div class="direction-grid">
            <button 
              v-for="dir in lightDirections" 
              :key="dir.value"
              class="direction-btn"
              :class="{ active: lightDirection === dir.value }"
              @click="lightDirection = dir.value"
            >
              <component :is="dir.icon" size="16" />
              <span>{{ dir.label }}</span>
            </button>
          </div>
        </div>

        <!-- 轮廓光 -->
        <div class="param-group">
          <h4 class="group-title">轮廓光</h4>
          <div class="rim-light-item">
            <div class="param-header">
              <span class="param-label">开启</span>
              <div class="toggle" :class="{ active: rimLight }" @click="rimLight = !rimLight">
                <div class="toggle-thumb"></div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-header">
                <span class="param-label">强度</span>
                <span class="param-value">{{ rimIntensity }}</span>
              </div>
              <div class="intensity-control">
                <div class="intensity-bar">
                  <div class="intensity-fill" :style="{ width: rimIntensity + '%' }"></div>
                </div>
                <button class="increase-btn" @click="increaseRimIntensity">
                  <ChevronUp size="14" />
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
  background: #1e1e20;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid #2a2a2a;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  padding: 8px 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #2d2d30;
  color: #fff;
  border-color: #444;
}

.tab:hover:not(.active) {
  background: #2a2a2d;
}

.panel-content {
  display: flex;
  gap: 20px;
}

.light-visualizer {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.light-circle {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 50%;
  position: relative;
  border: 2px solid #333;
}

.light-source {
  position: absolute;
  top: 20%;
  left: 60%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.light-cone {
  position: absolute;
  top: 20%;
  left: 60%;
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  transform-origin: top center;
  transform: translateX(-50%) rotate(-15deg);
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.param-label {
  font-size: 13px;
  font-weight: 500;
  color: #a0a0a0;
}

.param-value {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
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

.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.direction-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #a0a0a0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.direction-btn:hover {
  background: #2a2a2d;
}

.direction-btn.active {
  background: #2d2d30;
  color: #fff;
  border-color: #4a90e2;
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

.intensity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.intensity-bar {
  flex: 1;
  height: 8px;
  background: #3a3a3c;
  border-radius: 4px;
  overflow: hidden;
}

.intensity-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #64b5f6);
  border-radius: 4px;
  transition: width 0.3s;
}

.increase-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.2s;
}

.increase-btn:hover {
  background: #2a2a2a;
  color: #fff;
}
</style>