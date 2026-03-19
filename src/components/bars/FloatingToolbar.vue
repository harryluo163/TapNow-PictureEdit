<script setup lang="ts">
import { ref } from 'vue'
import {
  Wand2,
  Eraser,
  Maximize2,
  Expand,
  Scissors,
  Box,
  Lightbulb,
  Undo,
  Crop as CropIcon,
  Download,
  Fullscreen,
  Sparkles
} from 'lucide-vue-next'

const emit = defineEmits(['tool-click'])

const activeTool = ref('')

const tools = [
  { id: 'redraw', label: '重绘', icon: Wand2 },
  { id: 'erase', label: '擦除', icon: Eraser },
  { id: 'enhance', label: '增强', icon: Sparkles },
  { id: 'expand', label: '扩图', icon: Expand },
  { id: 'cutout', label: '抠图', icon: Scissors },
  { id: 'multiangle', label: '多角度', icon: Box },
  { id: 'lighting', label: '打光', icon: Lightbulb },
  { id: 'undo', label: '撤销', icon: Undo },
  { id: 'download', label: '下载', icon: Download },

]

const handleToolClick = (toolId: string) => {
  activeTool.value = toolId
  emit('tool-click', toolId)
}
</script>

<template>
  <div class="floating-toolbar">
    <div class="toolbar-container">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-btn"
        :class="{ active: activeTool === tool.id }"
        @click="handleToolClick(tool.id)"
        :title="tool.label"
      >
        <component :is="tool.icon" size="12" />
        <span class="tool-label">{{ tool.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.floating-toolbar {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toolbar-container {
  display: flex;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(42, 42, 42, 0.8);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #a0a0a0;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.tool-btn.active {
  background: rgba(100, 181, 246, 0.15);
  color: #64b5f6;
}

.tool-label {
  font-size: 10px;
}
</style>
