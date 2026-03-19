<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'select', 'add-image'])

const menuItems = [
  { id: 'add-asset', label: '添加资产' },
  { id: 'add-node', label: '添加节点' },
  { id: 'undo', label: '撤销', shortcut: 'Ctrl+Z' },
  { id: 'redo', label: '重做', shortcut: 'Shift+Ctrl+Z' },
  { id: 'paste', label: '粘贴', shortcut: 'Ctrl+V' },
]

// 默认图片
const defaultImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'

const handleItemClick = (item: any) => {
  emit('select', item.id)
  emit('close')
}

const handleAddImage = () => {
  emit('add-image', defaultImage)
  emit('close')
}
</script>

<template>
  <div class="add-node-menu">
    <!-- 菜单标题 -->
    <div class="menu-header">上传</div>
    
    <!-- 图片预览区域 -->
    <div class="image-preview" @click="handleAddImage">
      <img :src="defaultImage" alt="默认图片" class="preview-image" />
      <div class="preview-overlay">
        <span class="preview-text">点击添加图片</span>
      </div>
    </div>
    
    <!-- 菜单选项 -->
    <div 
      v-for="item in menuItems" 
      :key="item.id"
      class="menu-item"
      :class="{ active: item.id === 'add-asset' }"
      @click="handleItemClick(item)"
    >
      <span class="menu-label">{{ item.label }}</span>
      <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
    </div>
  </div>
</template>

<style scoped>
.add-node-menu {
  position: absolute;
  background: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 3000;
  min-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.menu-header {
  text-align: center;
  padding: 12px 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  border-bottom: 1px solid #333;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 150px;
  cursor: pointer;
  overflow: hidden;
  margin: 8px 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  height: 44px;
  color: #cccccc;
  font-size: 14px;
  font-weight: 400;
}

.menu-item:hover,
.menu-item.active {
  background: #2d2d2d;
  color: #ffffff;
}

.menu-label {
  color: inherit;
}

.menu-shortcut {
  color: #a0a0a0;
  font-size: 13px;
  font-weight: 300;
}
</style>