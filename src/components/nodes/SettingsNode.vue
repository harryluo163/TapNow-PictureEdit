<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { ref } from 'vue'
import { ChevronDown, Info, Clock, Zap } from 'lucide-vue-next'

interface SettingsNodeData {
  label: string
}

defineProps<{
  data: SettingsNodeData
}>()

const activeTab = ref('upscale')
const sliders = ref({
  sharpness: 7,
  grain: 7,
  detail: 30,
  scale: 2
})
</script>

<template>
  <div class="node-card w-480px bg-dark-200 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl text-sm">
    
    <!-- Tab 切换 -->
    <div class="flex p-1 bg-black-30 m-3 rounded-lg">
      <button 
        @click="activeTab = 'upscale'"
        :class="['flex-1 py-2 rounded-md text-xs font-medium transition-all', activeTab === 'upscale' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300']"
      >
        高清放大
      </button>
      <button 
        @click="activeTab = 'skin'"
        :class="['flex-1 py-2 rounded-md text-xs font-medium transition-all', activeTab === 'skin' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300']"
      >
        皮肤编辑器
      </button>
    </div>

    <div class="px-5 pb-5 space-y-4">
      <!-- 模型选择 -->
      <div class="flex items-center justify-between">
        <span class="text-zinc-400">模型选择</span>
        <div class="flex items-center gap-2 bg-dark-100 border border-zinc-700 px-3 py-1-5 rounded-md w-48 justify-between cursor-pointer hover:border-zinc-600">
          <span>Magnific</span>
          <ChevronDown size="14" class="text-zinc-500"/>
        </div>
      </div>

      <!-- 滑块组件封装 -->
      <div class="space-y-3 pt-2">
        <!-- 锐化强度 -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-zinc-400">
            <span class="flex items-center gap-1">锐化强度 <Info size="10"/></span>
            <span>{{ sliders.sharpness }}</span>
          </div>
          <input type="range" v-model="sliders.sharpness" min="0" max="10" class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
        </div>

        <!-- 颗粒增强 -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-zinc-400">
            <span class="flex items-center gap-1">颗粒增强 <Info size="10"/></span>
            <span>{{ sliders.grain }}</span>
          </div>
          <input type="range" v-model="sliders.grain" min="0" max="10" class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
        </div>

        <!-- 细节强度 -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-zinc-400">
            <span class="flex items-center gap-1">细节强度 <Info size="10"/></span>
            <span>{{ sliders.detail }}</span>
          </div>
          <input type="range" v-model="sliders.detail" min="0" max="100" class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
        </div>
        
         <!-- 放大倍数 -->
         <div class="space-y-1">
          <div class="flex justify-between text-xs text-zinc-400">
            <span>放大倍数</span>
            <span>{{ sliders.scale }}x</span>
          </div>
          <input type="range" v-model="sliders.scale" min="1" max="4" step="0.5" class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="bg-dark-100 p-3 flex items-center justify-between border-t border-zinc-800 text-xs text-zinc-500">
      <div class="flex items-center gap-2">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&q=60" class="w-6 h-6 rounded-full object-cover border border-zinc-700">
      </div>
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1"><Clock size="12"/> 2-5 min</span>
        <span class="flex items-center gap-1 bg-zinc-800 px-2 py-0-5 rounded text-zinc-300"><Zap size="12" class="text-yellow-500"/> 23~278</span>
      </div>
    </div>

    <!-- 连接点 -->
    <Handle type="target" position="left" class="w-3 h-3 bg-zinc-500 border-2 border-dark-100 hover:bg-white transition-colors" />
  </div>
</template>

<style scoped>
/* 自定义滑块样式细节 */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  margin-top: -4px; 
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}
</style>