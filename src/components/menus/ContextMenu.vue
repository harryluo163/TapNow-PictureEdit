<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'select'])

const menuItems = [
  { id: 'upload', label: '上传' },
  { id: 'add-asset', label: '添加资产' },
  { id: 'add-node', label: '添加节点' },
  { id: 'undo', label: '撤销', shortcut: 'Ctrl+Z' },
  { id: 'redo', label: '重做', shortcut: 'Shift+Ctrl+Z' },
  { id: 'paste', label: '粘贴', shortcut: 'Ctrl+V' },
]

const handleItemClick = (item: any) => {
  emit('select', item.id)
  emit('close')
}
</script>

<template>
  <div class="context-menu">
    <div 
      v-for="item in menuItems" 
      :key="item.id"
      class="menu-item"
      @click="handleItemClick(item)"
    >
      <span class="menu-label">{{ item.label }}</span>
      <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: absolute;
  background: #222;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 3000;
  min-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  height: 44px;
  color: #cccccc;
  font-size: 14px;
  font-weight: 400;
}

.menu-item:hover {
  background: #333;
  color: #ffffff;
}

.menu-label {
  color: inherit;
}

.menu-shortcut {
  color: #aaa;
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.2px;
}
</style>