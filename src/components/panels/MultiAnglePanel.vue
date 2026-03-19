<script setup lang="ts">
import { ref } from 'vue'
import { RotateCw, Zap, Maximize2 } from 'lucide-vue-next'

const rotation = ref(-30)
const tilt = ref(23)
const scale = ref(0)
const wideAngle = ref(false)

const reset = () => {
  rotation.value = 0
  tilt.value = 0
  scale.value = 0
}

const increaseAngle = () => {
  rotation.value += 10
}
</script>

<template>
  <div class="multi-angle-panel">
    <div class="panel-header">
      <h3>拖拽方块调整角度</h3>
    </div>
    
    <div class="panel-content">
      <!-- 左侧3D预览区 -->
      <div class="preview-3d">
        <div class="cube-container">
          <div class="cube">
            <div class="cube-face front">
              <div class="cube-icon">🖼️</div>
            </div>
            <div class="cube-face back"></div>
            <div class="cube-face right"></div>
            <div class="cube-face left"></div>
            <div class="cube-face top"></div>
            <div class="cube-face bottom"></div>
          </div>
        </div>
        <button class="reset-btn" @click="reset">
          <RotateCw size="12" />
          重置
        </button>
      </div>
      
      <!-- 右侧参数区 -->
      <div class="params-section">
        <div class="param-item">
          <div class="param-header">
            <span class="param-label">旋转</span>
            <span class="param-value">{{ rotation }}°</span>
          </div>
          <input 
            type="range" 
            v-model="rotation" 
            min="-90" 
            max="90" 
            class="slider"
          />
        </div>
        
        <div class="param-item">
          <div class="param-header">
            <span class="param-label">倾斜</span>
            <span class="param-value">{{ tilt }}°</span>
          </div>
          <input 
            type="range" 
            v-model="tilt" 
            min="-45" 
            max="45" 
            class="slider"
          />
        </div>
        
        <div class="param-item">
          <div class="param-header">
            <span class="param-label">缩放</span>
            <span class="param-value">{{ scale }}</span>
          </div>
          <input 
            type="range" 
            v-model="scale" 
            min="-50" 
            max="50" 
            class="slider"
          />
        </div>
        
        <div class="param-item">
          <div class="param-header">
            <span class="param-label">广角镜头</span>
            <div class="toggle" :class="{ active: wideAngle }" @click="wideAngle = !wideAngle">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
        
        <div class="quick-actions">
          <button class="quick-btn" @click="rotation = 10">
            <span>🔄 10</span>
          </button>
          <button class="quick-btn" @click="increaseAngle">
            <Maximize2 size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multi-angle-panel {
  background: #121212;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid #1a1a1a;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.panel-content {
  display: flex;
  gap: 20px;
}

.preview-3d {
  flex: 0 0 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cube-container {
  width: 100px;
  height: 100px;
  perspective: 1000px;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-30deg) rotateY(-45deg);
}

.cube-face {
  position: absolute;
  width: 60px;
  height: 60px;
  left: 20px;
  top: 20px;
  border: 2px solid #444;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cube-face.front {
  transform: translateZ(30px);
}

.cube-face.back {
  transform: rotateY(180deg) translateZ(30px);
}

.cube-face.right {
  transform: rotateY(90deg) translateZ(30px);
}

.cube-face.left {
  transform: rotateY(-90deg) translateZ(30px);
}

.cube-face.top {
  transform: rotateX(90deg) translateZ(30px);
}

.cube-face.bottom {
  transform: rotateX(-90deg) translateZ(30px);
}

.cube-icon {
  font-size: 20px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #2a2a2a;
  color: #fff;
}

.params-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  background: #333;
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

.toggle {
  width: 44px;
  height: 22px;
  background: #333;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-thumb {
  position: absolute;
  top: 1px;
  left: 1px;
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
  transform: translateX(22px);
  background: #fff;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.quick-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #2a2a2a;
  color: #fff;
  border-color: #444;
}
</style>