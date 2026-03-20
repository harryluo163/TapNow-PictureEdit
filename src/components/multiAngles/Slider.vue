<template>
  <div 
    ref="sliderRef"
    class="slider"
    :class="{ dragging: isDragging }"
    @mousedown="startDrag"
    @touchstart="startDrag"
    role="slider"
    :aria-valuenow="value"
    :aria-valuemin="min"
    :aria-valuemax="max"
  >
    <!-- 轨道背景 -->
    <div class="slider-track-bg"></div>
    
    <!-- 激活轨道 -->
    <div class="slider-track-active" :style="{ width: `${percentage}%` }"></div>
    
    <!-- 滑块 -->
    <div class="slider-thumb" :style="{ left: `${percentage}%` }">
      <div class="slider-thumb-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 }
})

const emit = defineEmits(['update:value'])

const sliderRef = ref(null)
const isDragging = ref(false)

// 计算百分比（0-100）
const percentage = computed(() => {
  const range = props.max - props.min
  return ((props.value - props.min) / range) * 100
})

// 更新值
const updateValue = (e) => {
  const rect = sliderRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = e.clientX - rect.left
  const percent = Math.min(Math.max(x / rect.width, 0), 1)
  const newValue = props.min + percent * (props.max - props.min)
  emit('update:value', newValue)
}

// 开始拖拽
const startDrag = (e) => {
  isDragging.value = true
  const event = e.touches ? e.touches[0] : e
  updateValue(event)
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onTouchDrag)
  document.addEventListener('touchend', endDrag)
}

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return
  updateValue(e)
}

// 触摸拖拽中
const onTouchDrag = (e) => {
  if (!isDragging.value) return
  updateValue(e.touches[0])
}

// 结束拖拽
const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onTouchDrag)
  document.removeEventListener('touchend', endDrag)
}

// 清理事件监听
onUnmounted(() => {
  endDrag()
})
</script>

<style scoped>
/* 滑块容器 */
.slider {
  position: relative;
  padding: 8px 0;
  cursor: grab;
  user-select: none;
  width: 100%;
}

.slider.dragging {
  cursor: grabbing;
}

/* 轨道背景 */
.slider-track-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: #333;
  transition: background 0.2s;
}

/* 激活轨道 */
.slider-track-active {
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* 滑块 */
.slider-thumb {
  position: absolute;
  top: 50%;
  left: 0;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(-50%);
  transition: transform 0.2s, box-shadow 0.2s;
}

/* 悬停效果 */
.slider:hover .slider-track-bg {
  background: #444;
}

.slider:hover .slider-thumb {
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2);
}

/* 拖拽效果 */
.slider.dragging .slider-thumb {
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.3);
}
</style>