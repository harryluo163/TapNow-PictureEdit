<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Upload } from 'lucide-vue-next'

interface ImageOnlyNodeData {
  label: string
  imageUrl: string
}

defineProps<{
  data: ImageOnlyNodeData
}>()

const emit = defineEmits(['image-click'])

const handleImageClick = (event: MouseEvent) => {
  event.stopPropagation()
  emit('image-click')
}
</script>

<template>
  <div class="image-only-node" @click="handleImageClick">
    <!-- 图片区域 -->
    <div class="image-container">
      <img :src="data.imageUrl" class="image" alt="上传的图片" />
      <div class="upload-overlay">
        <Upload size="16" />
        <span>上传</span>
      </div>
    </div>

    <!-- 连接点 -->
    <Handle type="source" position="right" class="handle" />
  </div>
</template>

<style scoped>
.image-only-node {
  background: transparent;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-only-node:hover {
  transform: scale(1.02);
}

.image-container {
  position: relative;
  width: 300px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.image-only-node:hover .upload-overlay {
  background: rgba(0, 0, 0, 0.85);
}

.handle {
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border: 2px solid #fff;
  border-radius: 50%;
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s ease;
}

.handle:hover {
  background: #64b5f6;
  transform: translateY(-50%) scale(1.2);
}
</style>