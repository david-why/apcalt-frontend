<script setup lang="ts">
defineProps({ url: { type: String, required: true } })
</script>

<template>
  <iframe
    class="wistia-video"
    :src="'//fast.wistia.net/embed/iframe/' + url"
    allow="fullscreen"
    allowfullscreen
    mozallowfullscreen
    webkitallowfullscreen
    oallowfullscreen
    msallowfullscreen
  ></iframe>
</template>

<style scoped>
.wistia-video {
  background-color: var(--color-background);
  border: none;
  width: 600px;
  height: 400px;
  min-width: 60vw;
  min-height: 60vh;
}
</style>
