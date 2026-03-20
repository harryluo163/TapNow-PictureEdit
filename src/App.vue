<script setup lang="ts">
import FlowEditor from './components/FlowEditor.vue'
</script>

<template>
  <FlowEditor />
</template>

<style>
/* 全局样式重置与背景 */
body {
  margin: 0;
  background-color: #050505;
  color: white;
  user-select: none;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>