import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNodeStore = defineStore('node', () => {
  // 工具栏显示状态
  const showToolbar = ref(false)
  
  // 面板显示状态（互斥）
  const activePanel = ref<'multiangle' | 'lighting' | null>(null)
  
  // 显示工具栏
  const setShowToolbar = (show: boolean) => {
    showToolbar.value = show
  }
  
  // 切换工具栏显示
  const toggleToolbar = () => {
    showToolbar.value = !showToolbar.value
  }
  
  // 显示指定面板（互斥）
  const showPanel = (panelType: 'multiangle' | 'lighting') => {
    if (activePanel.value === panelType) {
      // 如果当前面板已显示，则关闭
      activePanel.value = null
    } else {
      // 否则显示新面板
      activePanel.value = panelType
    }
    showToolbar.value = false
  }
  
  // 关闭所有面板
  const closeAllPanels = () => {
    activePanel.value = null
    showToolbar.value = false
  }
  
  return {
    showToolbar,
    activePanel,
    setShowToolbar,
    toggleToolbar,
    showPanel,
    closeAllPanels
  }
})