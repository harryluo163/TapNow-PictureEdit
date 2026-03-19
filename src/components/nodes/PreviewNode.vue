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
    <Handle type="target" position="left" class="w-3 h-3 bg-zinc-500 border-2 border-dark-100 hover:bg-white transition-colors" />
    <Handle type="source" position="right" class="w-3 h-3 bg-zinc-500 border-2 border-dark-100 hover:bg-white transition-colors" />
  </div>
</template>