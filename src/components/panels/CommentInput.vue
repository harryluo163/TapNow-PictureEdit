<script setup lang="ts">
import { ref } from 'vue'
import { Send } from 'lucide-vue-next'

const comment = ref('')
const maxLength = 200

const sendComment = () => {
  if (comment.value.trim()) {
    console.log('发送评论:', comment.value)
    comment.value = ''
  }
}
</script>

<template>
  <div class="comment-input">
    <textarea
      v-model="comment"
      :maxlength="maxLength"
      placeholder="输入你的评论..."
      class="comment-textarea"
      rows="3"
    ></textarea>
    <div class="comment-footer">
      <span class="char-count">{{ comment.length }}/{{ maxLength }}</span>
      <button 
        class="send-btn" 
        :class="{ disabled: !comment.trim() }"
        @click="sendComment"
      >
        <Send size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.comment-input {
  background: #1e1e20;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid #2a2a2a;
  min-width: 280px;
}

.comment-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
}

.comment-textarea::placeholder {
  color: #a0a0a0;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 12px;
  color: #666;
  font-weight: 400;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #2a2a2d;
  border: 1px solid #3a3a3c;
  border-radius: 50%;
  color: #a0a0a0;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(.disabled) {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #fff;
}

.send-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>