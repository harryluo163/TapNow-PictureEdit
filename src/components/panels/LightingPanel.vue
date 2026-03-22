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
          <LightingScene :image-url="props.imageUrl" />
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
              min="0"
              max="100"
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
              min="2700"
              max="6500"
              class="slider"
              data-type="color-temp"
              @mousedown.stop
              @touchstart.stop
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
              @click.stop="lightDirection = dir.value"
            >

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
              <div class="toggle" :class="{ active: rimLight }" @click.stop="rimLight = !rimLight">
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
                <button class="increase-btn" @click.stop="increaseRimIntensity">
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
  width: 500px;
  background: #1e1e20;
  border-radius: 8px;
  padding: 16px;
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
  gap: 16px;
  align-items: flex-start;
}

.light-visualizer {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 280px;
  pointer-events: none;
  position: relative;
}

.view-toggle-float {
  position: absolute;
  top: 3px;
  left: 76px;
  display: flex;
  pointer-events: auto;
  z-index: 10;
}

.view-toggle-btn {
  padding: 3px 6px;
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
  gap: 12px;
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
  gap: 8px;
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
  gap: 12px;
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
  background: #2d2d2f;
  border: 1px solid #333;
  border-radius: 4px;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.2s;
}

.increase-btn:hover {
  background: #3a3a3c;
  color: #fff;
}
</style>
