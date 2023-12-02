<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (event: 'close'): any
}>()

function close() {
  emit('close')
}

onMounted(() => console.log('mount overlay'))
onUnmounted(() => console.log('unmount overlay'))
</script>

<template>
  <div class="overlay" @click="close">
    <div class="content" @click.stop>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0008;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  background-color: unset;
}
</style>
