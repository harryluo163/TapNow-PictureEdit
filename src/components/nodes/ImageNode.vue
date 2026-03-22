<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Upload, Image as ImageIcon } from 'lucide-vue-next'
import CommentTrigger from '../triggers/CommentTrigger.vue'
import FloatingToolbar from '../bars/FloatingToolbar.vue'
import AngleEditor from '../multiAngles/AngleEditor.vue'
import LightingPanel from '../panels/LightingPanel.vue'
import { useNodeStore } from '../../stores/nodeStore'

interface ImageNodeData {
  label: string
  imageUrl: string
}

defineProps<{
  data: ImageNodeData
}>()

const nodeStore = useNodeStore()
const isHandleHovered = ref(false)

const handleImageClick = (event: MouseEvent) => {
  event.stopPropagation()
  nodeStore.toggleToolbar()
}

const handleCommentTrigger = () => {
  window.dispatchEvent(new CustomEvent('show-comment-panel'))
}

const handleToolClick = (toolId: string) => {
  if (toolId === 'multiangle') {
    nodeStore.showPanel('multiangle')
  } else if (toolId === 'lighting') {
    nodeStore.showPanel('lighting')
  }
}

const closePanel = () => {
  nodeStore.closeAllPanels()
}
</script>

<template>
  <div class="node-card" @click="handleImageClick">
    <!-- 浮动工具栏 -->
    <FloatingToolbar
      v-if="nodeStore.showToolbar"
      @tool-click="handleToolClick"
    />



    <!-- 打光控制面板 -->
    <div v-if="nodeStore.activePanel === 'lighting'" class="panel-wrapper panel-bottom-left">
      <LightingPanel :image-url="data.imageUrl" />
      <button class="close-panel-btn" @click="closePanel">✕</button>
    </div>
    <!-- 多角度调整面板 -->
    <div v-if="nodeStore.activePanel === 'multiangle'" class="panel-wrapper panel-bottom" @mousedown.stop>
      <AngleEditor :image-url="data.imageUrl" @close="closePanel" />
    </div>
    <!-- 内容区域 -->
    <div class="flex flex-col items-center justify-center relative min-h-300px">
      <!-- 顶部提示文字 -->
      <div class="upload-hint text-xs text-zinc-500 mb-2 flex items-center gap-2">

        <span> <ImageIcon size="12" class="icon-aligned" />upload image, click "Image Enhancement"</span>

      </div>

      <!-- 图片 -->
      <div class="relative group">
        <img :src="data.imageUrl" class="w-48 h-64 object-cover rounded-lg shadow-lg border border-zinc-700" />
        <div class="absolute top-2 right-2 bg-black-60 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer hover:bg-black-80">
          <Upload size="12"/> 替换
        </div>
      </div>
    </div>

    <!-- 输出连接点 -->
    <div class="handle-wrapper">
      <Handle
        type="source"
        position="right"
        id="image-output"
        class="handle-point w-3 h-3 bg-zinc-500 border-2 border-dark-100 hover:bg-white transition-colors z-50"
        @mouseenter="isHandleHovered = true"
        @mouseleave="isHandleHovered = false"
        @click="(e) => console.log('Handle clicked:', e)"
      />
      <!-- 悬停时显示 CommentTrigger -->
      <div v-if="isHandleHovered" class="comment-trigger-popup">
        <CommentTrigger @click="handleCommentTrigger" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-card {
  background: transparent;
  border: none;
  border-radius: 12px;
  overflow: visible;
  position: relative;
  cursor: pointer;
}

.upload-hint {
  text-align: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-card:hover .upload-hint {
  opacity: 1;
}

.icon-aligned {
  vertical-align: text-bottom;
  margin-bottom: 1px;
}

.handle-wrapper {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  pointer-events: none !important;
}

.handle-point {
  pointer-events: auto !important;
  cursor: crosshair !important;
  position: relative !important;
}

.handle-point:hover {
  transform: scale(1.3);
  background: #fff !important;
}

.comment-trigger-popup {
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.panel-wrapper {
  position: absolute;
  z-index: 100;
  animation: slideUp 0.3s ease-out;
}

.panel-bottom {
  bottom: -330px;
  left: 50%;
  transform: translateX(-50%);
}

.panel-bottom-left {
  bottom: -435px;
  left: -148px;
}

.close-panel-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-panel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
