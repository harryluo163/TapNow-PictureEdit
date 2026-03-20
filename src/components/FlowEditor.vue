<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'

// 引入自定义节点
import ImageNode from './nodes/ImageNode.vue'
import ImageOnlyNode from './nodes/ImageOnlyNode.vue'
import PreviewNode from './nodes/PreviewNode.vue'
import SettingsNode from './nodes/SettingsNode.vue'

// 引入右键菜单组件
import ContextMenu from './menus/ContextMenu.vue'
import AddNodeMenu from './menus/AddNodeMenu.vue'

// 注册节点类型
const nodeTypes = {
  imageNode: ImageNode,
  imageOnlyNode: ImageOnlyNode,
  previewNode: PreviewNode,
  settingsNode: SettingsNode,
}

// 类型定义
interface NodeData {
  label: string
  imageUrl?: string
}

interface Edge {
  id: string
  source: string
  target: string
  animated?: boolean
  style?: {
    stroke: string
    strokeWidth: number
  }
}

interface Node {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  data: NodeData
}

// 状态管理
const elements = ref<(Node | Edge)[]>([
  // 左侧图片节点
  {
    id: '1',
    type: 'imageNode',
    position: { x: 50, y: 100 },
    data: {
      label: 'Image Input',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
  },
  // 右上预览节点
  {
    id: '2',
    type: 'previewNode',
    position: { x: 800, y: 50 },
    data: { label: 'Upscale Process' },
  },
  // 右下设置节点
  {
    id: '3',
    type: 'settingsNode',
    position: { x: 800, y: 400 },
    data: { label: 'Settings' },
  },
  // 连线
  { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#fff', strokeWidth: 2 } }
])

// 右键菜单状态
const showContextMenu = ref(false)
const showAddNodeMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const nodeIdCounter = ref(4) // 从4开始，因为已经有3个节点

// 小地图显示状态
const showMiniMap = ref(false)

const { fitView, zoomIn, zoomOut, setViewport, onViewportChange, viewport } = useVueFlow()

// 选中的连接线
const selectedEdgeId = ref<string | null>(null)

// 缩放级别状态
const currentZoom = ref(1)
const zoomRange = [0.1, 4] // 缩放范围

// 监听视口变化
onViewportChange(({ zoom }) => {
  currentZoom.value = zoom
})

// 处理缩放滑动条变化
const handleZoomChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const zoomValue = parseFloat(target.value)
  setViewport({
    x: viewport.value.x,
    y: viewport.value.y,
    zoom: zoomValue
  })
}

// 处理节点点击
const handleNodeClick = (event: any) => {
  // 节点点击由组件内部处理
}

// 处理节点鼠标悬停
const handleNodeMouseEnter = (event: any) => {
  const node = event.node || event
  if (node && node.type === 'imageNode') {
    // 可以在这里添加悬停逻辑
  }
}

// 处理画布点击（关闭所有面板和菜单）
const handleCanvasClick = (event: MouseEvent) => {
  // 如果点击的是画布区域（不是节点或面板），关闭所有菜单
  if (event.target === event.currentTarget) {
    showContextMenu.value = false
    showAddNodeMenu.value = false
    showMiniMap.value = false
    selectedEdgeId.value = null // 取消选择连接线
  }
}

// 处理连接线选择
const handleEdgeClick = (event: any) => {
  selectedEdgeId.value = event.edge.id
}

// 处理连接事件
const handleConnect = (connection: any) => {
  console.log('连接事件触发:', connection)

  // 检查连接是否有效
  if (!connection.source || !connection.target) {
    console.log('连接无效：缺少 source 或 target')
    return
  }

  // 检查是否重复连接
  const isDuplicate = elements.value.some(
    (el: any) => el.source === connection.source && el.target === connection.target
  )

  if (isDuplicate) {
    console.log('连接重复')
    return
  }

  // 创建新的连接线
  const newEdge: Edge = {
    id: `e${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    animated: false,
    style: { stroke: '#555', strokeWidth: 2 }
  }
  elements.value.push(newEdge)
  console.log('连接成功添加:', newEdge)
}

// 处理连接开始事件
const handleConnectStart = () => {
  // 可以在这里添加连接开始时的逻辑
}

// 处理连接结束事件
const handleConnectEnd = () => {
  // 可以在这里添加连接结束时的逻辑
}

// 处理连接线双击（删除）
const handleEdgeDoubleClick = (event: any) => {
  deleteEdgeById(event.edge.id)
}

// 删除选中的连接线
const deleteSelectedEdge = () => {
  if (selectedEdgeId.value) {
    deleteEdgeById(selectedEdgeId.value)
  }
}

// 根据 ID 删除连接线
const deleteEdgeById = (edgeId: string) => {
  const index = elements.value.findIndex(el => el.id === edgeId)
  if (index !== -1) {
    elements.value.splice(index, 1)
  }
  selectedEdgeId.value = null
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()

  // 检查点击目标是否是节点
  const target = event.target as HTMLElement
  const isNode = target.closest('.vue-flow__node')

  if (!isNode) {
    // 如果不是节点，则显示右键菜单
    contextMenuPosition.value = { x: event.clientX, y: event.clientY }
    showContextMenu.value = true
  }
}

// 处理右键菜单项选择
const handleContextMenuSelect = (itemId: string) => {
  if (itemId === 'add-node') {
    showAddNodeMenu.value = true
  }
}

// 处理添加图片节点
const handleAddImage = (imageUrl: string) => {
  const newNode: Node = {
    id: `image-${nodeIdCounter.value++}`,
    type: 'imageOnlyNode',
    position: {
      x: contextMenuPosition.value.x - 150,
      y: contextMenuPosition.value.y - 200
    },
    data: {
      label: `Image ${nodeIdCounter.value}`,
      imageUrl: imageUrl
    },
  }
  elements.value.push(newNode)
}

onMounted(() => {
  setTimeout(() => fitView(), 100)

  // 添加全局点击监听，用于关闭右键菜单和小地图
  window.addEventListener('click', (e) => {
    if (showContextMenu.value || showAddNodeMenu.value || showMiniMap.value) {
      const target = e.target as HTMLElement
      const isControlButton = target.closest('.control-button')
      const isMiniMap = target.closest('.minimap-panel')
      const isContextMenu = target.closest('.context-menu')
      const isAddNodeMenu = target.closest('.add-node-menu')

      // 如果点击的不是这些区域，则关闭
      if (!isControlButton && !isMiniMap && !isContextMenu && !isAddNodeMenu) {
        showContextMenu.value = false
        showAddNodeMenu.value = false
        showMiniMap.value = false
      }
    }
  })

  // 添加键盘事件监听，用于删除连接线
  window.addEventListener('keydown', (e) => {
    // 检测 delete 或 backspace 键
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId.value) {
      deleteSelectedEdge()
    }
  })
})
</script>

<template>
  <div class="flow-container" @click="handleCanvasClick">
    <VueFlow
      v-model="elements"
      :node-types="nodeTypes"
      :selected-elements="selectedEdgeId ? [{ id: selectedEdgeId, type: 'edge' }] : []"
      :default-edge-options="{  animated: false, style: { stroke: '#555', strokeWidth: 2 } }"
      :pan-on-scroll="true"
      :zoom-on-scroll="true"
      :pan-on-drag="[2]"
      :zoom-on-pinch="true"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :connect-on-click="false"
      :elements-selectable="true"
      :nodes-draggable="true"
      :nodes-connectable="true"
      :elements-focusable="true"
      :connection-line-type="'straight'"
      :connection-mode="'loose'"
      class="bg-dark-500"
      @node-click="handleNodeClick"
      @node-mouseenter="handleNodeMouseEnter"
      @edge-click="handleEdgeClick"
      @edge-double-click="handleEdgeDoubleClick"
      @contextmenu="handleContextMenu"
      @connect="handleConnect"
      @connect-start="handleConnectStart"
      @connect-end="handleConnectEnd"
    >
      <!-- 背景点阵网格 -->
      <Background color="#333" :size="1" :gap="20" />

      <!-- 连接线删除按钮（选中时显示） -->
      <Panel v-if="selectedEdgeId" class="edge-delete-panel" position="top-right">
        <button class="edge-delete-button" @click="deleteSelectedEdge" title="删除连接线 (Delete)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6l6-6"></path>
            <path d="M6 15l6-6l6 6"></path>
          </svg>
        </button>
      </Panel>

      <!-- 左下角控制栏 -->
      <Panel class="custom-controls" position="bottom-left">
        <div class="controls-container">
          <!-- 小地图图标按钮 -->
          <button
            class="control-button"
            @click="showMiniMap = !showMiniMap"
            :class="{ active: showMiniMap }"
          >
            <svg t="1769079366396" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5404" width="16" height="16" fill="currentColor"><path d="M512 659.093333c32 0 211.306667-224.426667 211.306667-341.333333a211.306667 211.306667 0 0 0-422.613334 0c0 116.906667 179.306667 341.333333 211.306667 341.333333z m-136.64-341.333333a136.64 136.64 0 0 1 273.28 0c0 22.773333-17.866667 76.64-68.16 153.546667a814.826667 814.826667 0 0 1-68.48 90.666666 814.826667 814.826667 0 0 1-68.48-90.666666C393.226667 394.666667 375.36 340.746667 375.36 317.973333z" p-id="5405" fill="currentColor"></path><path d="M512 306.186667m-53.333333 0a53.333333 53.333333 0 1 0 106.666666 0 53.333333 53.333333 0 1 0-106.666666 0Z" p-id="5406" fill="currentColor"></path><path d="M771.466667 405.706667l33.333333 42.933333a5.333333 5.333333 0 0 0 7.573333 0.8l21.6-17.866667a5.333333 5.333333 0 0 1 8.693334 4.106667v268.96a5.333333 5.333333 0 0 1-2.4 4.48l-187.253334 122.186667a5.333333 5.333333 0 0 1-5.333333 0l-281.12-162.133334a5.333333 5.333333 0 0 0-5.333333 0l-171.626667 115.573334a5.333333 5.333333 0 0 1-8.266667-4.373334V510.72a5.333333 5.333333 0 0 1 1.866667-4.106667l69.333333-58.186666a5.333333 5.333333 0 0 0 0.96-7.04l-33.44-49.653334a5.333333 5.333333 0 0 0-7.466666-1.386666L108.96 462.72a5.333333 5.333333 0 0 0-2.293333 4.373333v440.533334a5.333333 5.333333 0 0 0 8.16 4.48L362.666667 753.76a5.333333 5.333333 0 0 1 5.333333 0l280.533333 162.133333a5.333333 5.333333 0 0 0 5.333334 0l260.533333-162.08a5.333333 5.333333 0 0 0 2.506667-4.48V309.333333a5.333333 5.333333 0 0 0-8.32-4.373333l-135.946667 93.12a5.333333 5.333333 0 0 0-1.173333 7.626667z" p-id="5407" fill="currentColor"></path></svg>
          </button>

          <!-- 适配视图按钮 -->
          <button class="control-button" @click="fitView">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-focus-centered "><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M4 8v-2a2 2 0 0 1 2 -2h2"></path><path d="M4 16v2a2 2 0 0 0 2 2h2"></path><path d="M16 4h2a2 2 0 0 1 2 2v2"></path><path d="M16 20h2a2 2 0 0 0 2 -2v-2"></path></svg>
          </button>

          <!-- 缩放滑动条 -->
          <div class="zoom-slider-compact">
            <input
              type="range"
              :min="zoomRange[0]"
              :max="zoomRange[1]"
              :step="0.1"
              :value="currentZoom"
              @input="handleZoomChange"
              class="zoom-input"
            />
            <span class="zoom-value">{{ Math.round(currentZoom * 100) }}%</span>
          </div>
        </div>
      </Panel>

      <!-- 小地图（点击按钮后显示） -->
      <MiniMap
        style="bottom:46px"
        v-if="showMiniMap"
        class="custom-minimap"
        node-color="#888"
        node-stroke-color="#fff"
        node-stroke-width="2"
        mask-color="rgba(0, 0, 0, 0.6)"
        :pannable="true"
        :zoomable="true"
      />
    </VueFlow>

    <!-- 右键菜单 -->
    <ContextMenu
      v-if="showContextMenu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @select="handleContextMenuSelect"
      @close="showContextMenu = false"
    />

    <!-- 节点添加菜单 -->
    <AddNodeMenu
      v-if="showAddNodeMenu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @select="handleContextMenuSelect"
      @add-image="handleAddImage"
      @close="showAddNodeMenu = false"
    />
  </div>
</template>

<style scoped>
/* 流编辑器容器 */
.flow-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 自定义 Vue Flow 的连线样式 */
.vue-flow__edge-path {
  stroke: #555;
  stroke-width: 2;
  stroke-dasharray: none;
  animation: none;
}

.vue-flow__edge-path:hover {
  stroke: #fff;
  stroke-width: 2;
}

/* 禁用节点的 transform，防止悬停时移动 */
.vue-flow__node {
  transform: none !important;
  transition: none !important;
}

.vue-flow__node:hover {
  transform: none !important;
}

/* 选中连接线的样式 */
.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #fff;
  stroke-width: 3;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}

/* 连接线删除按钮面板 */
.edge-delete-panel {
  background: #1a1a1a !important;
  border: 1px solid #444 !important;
  border-radius: 6px !important;
  padding: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  z-index: 1000 !important;
}

.edge-delete-button {
  background: transparent !important;
  border: none !important;
  color: #ff4444 !important;
  padding: 6px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 4px !important;
}

.edge-delete-button:hover {
  background: rgba(255, 68, 68, 0.1) !important;
  transform: scale(1.1);
}

.edge-delete-button svg {
  stroke: #ff4444 !important;
}

.edge-delete-button:hover svg {
  stroke: #ff6666 !important;
}

/* 移除连线箭头标记 */
.vue-flow__marker {
  display: none;
}

.vue-flow__edge path {
  marker-end: url('');
}

.vue-flow__connection-line {
  stroke-dasharray: none;
}

/* 自定义控制栏样式 */
.custom-controls {
  background: #1a1a1a !important;
  border: 1px solid #333 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  border-radius: 8px !important;
  padding: 6px !important;
}

.controls-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-button {
  background: transparent !important;
  border: none !important;
  color: #ccc !important;
  border-radius: 6px !important;
  padding: 6px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.control-button svg {
  stroke: #ccc !important;
}

.control-button:hover svg {
  stroke: #fff !important;
}

.control-button.active {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

/* 小地图面板样式 */
.minimap-panel {
  position: absolute !important;
  left: 0 !important;
  bottom: 80px !important;
  background: #1a1a1a !important;
  border: 1px solid #333 !important;
  border-radius: 8px !important;
  padding: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  z-index: 5 !important;
}

/* 紧凑型缩放滑动条样式 */
.zoom-slider-compact {
  padding: 6px 10px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.zoom-slider-compact svg {
  stroke: #ccc !important;
  flex-shrink: 0;
}

.zoom-input {
  flex: 1;
  width: 80px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.zoom-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.zoom-input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.zoom-input::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.zoom-value {
  color: #ccc;
  font-size: 11px;
  font-weight: 500;
  min-width: 38px;
  text-align: right;
  user-select: none;
}

/* 小地图样式 */
.custom-minimap {
  background: #2a2a2a !important;
  border: 1px solid #444 !important;
  border-radius: 4px !important;
  overflow: hidden !important;
  cursor: pointer !important;
  left: 0px;
  bottom: 46px;
}

.custom-minimap.vue-flow__minimap {
  width: 250px !important;
  height: 180px !important;
}

.custom-minimap .vue-flow__minimap-mask {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
}

/* 确保小地图面板正确显示 */
.minimap-panel.vue-flow__panel {
  width: auto !important;
  height: auto !important;
}

/* 连接线 handle 样式 */
.vue-flow__handle {
  width: 16px !important;
  height: 16px !important;
  background: #888 !important;
  border: 2px solid #666 !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  pointer-events: all !important;
  cursor: crosshair !important;
  position: absolute !important;
  z-index: 1000 !important;
}

.vue-flow__handle:hover {
  background: #4CAF50 !important;
  border-color: #fff !important;
  transform: scale(1.3) !important;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6) !important;
}

.vue-flow__handle.handle-target {
  background: #FF9800 !important;
  border-color: #FFB74D !important;
}

.vue-flow__handle.handle-target:hover {
  background: #4CAF50 !important;
  border-color: #fff !important;
}

/* 连接线正在拖拽时的样式 */
.vue-flow__connection-line {
  stroke: #4CAF50 !important;
  stroke-width: 2 !important;
  stroke-dasharray: 5, 5 !important;
}

/* 确保 handle 可以交互 */
.vue-flow__node .vue-flow__handle {
  position: absolute !important;
  z-index: 100 !important;
}
</style>
