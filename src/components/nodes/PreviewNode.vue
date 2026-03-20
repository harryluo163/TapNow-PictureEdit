<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Monitor, Plus } from 'lucide-vue-next'

interface PreviewNodeData {
  label: string
}

defineProps<{
  data: PreviewNodeData
}>()

const emit = defineEmits(['settings-click'])

const handleHeaderClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('settings-click')
}
</script>

<template>
  <div class="node-card w-400px bg-dark-100 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
    <!-- 顶部标签（可点击） -->
    <div 
      class="px-4 py-2 bg-dark-200 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400 cursor-pointer hover:bg-dark-300 transition-colors"
      @click="handleHeaderClick"
    >
      <span class="flex items-center gap-1"><Monitor size="12"/> 4K / 1080P · Realistic Portrait</span>
    </div>

    <!-- 中间内容 -->
    <div class="h-48 bg-dark-400 flex items-center justify-center relative group">
      <div class="text-zinc-600 text-xs flex flex-col items-center gap-2">
        <span>配置参数生成增强图像</span>
      </div>
      
      <!-- 角落的加号图标 -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white cursor-pointer transition-colors">
        <Plus size="14"/>
      </div>
    </div>

    <!-- 连接点 -->
    <Handle
      type="target"
      id="preview-input"
      position="left"
      class="handle-point handle-target w-4 h-4 bg-zinc-600 border-2 border-zinc-400 hover:bg-white hover:border-white transition-all cursor-crosshair"
    />
    <Handle
      type="source"
      id="preview-output"
      position="right"
      class="handle-point handle-source w-4 h-4 bg-zinc-600 border-2 border-zinc-400 hover:bg-white hover:border-white transition-all cursor-crosshair"
    />
  </div>
</template>

<style scoped>
.node-card {
  position: relative;
}

.handle-point {
  pointer-events: auto !important;
  transition: all 0.2s ease !important;
  position: absolute !important;
  z-index: 100 !important;
}

.handle-point:hover {
  transform: scale(1.3) !important;
  background: #4CAF50 !important;
  border-color: #fff !important;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6) !important;
}

.handle-target {
  background: #FF9800 !important;
  border-color: #FFB74D !important;
}

.handle-target:hover {
  background: #4CAF50 !important;
  border-color: #fff !important;
}
</style>