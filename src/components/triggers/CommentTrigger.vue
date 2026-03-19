<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template>
  <div class="comment-trigger" @click="emit('click')">
    <div class="plus-icon">+</div>
  </div>
</template>

<style scoped>
.comment-trigger {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  top: 50%;
  right: -16px;
  transform: translateY(-50%);
}

.comment-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.plus-icon {
  font-size: 20px;
  color: #fff;
  font-weight: 300;
  margin-bottom: 5px;
}
</style>
