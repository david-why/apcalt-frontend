<script setup lang="ts">
import WistiaComponent from '@/components/WistiaComponent.vue'
import OverlayComponent from '@/components/layout/OverlayComponent.vue'
import { finishVideo } from '@/service'
import { useNotificationStore } from '@/stores';
import { useRoute } from 'vue-router'
const notifyStore = useNotificationStore()

const route = useRoute()
const subjectId = route.params.subjectId as string
const url = route.params.url as string
const videoId = route.params.videoId as string

async function doFinishVideo() {
  await finishVideo(subjectId, url, videoId)
  notifyStore.notify('Finished video')
}
</script>

<template>
  <!-- <OverlayComponent> -->
  <WistiaComponent :url="url"></WistiaComponent>
  <!-- </OverlayComponent> -->
  <p>
    <button @click="doFinishVideo">Finish</button>
  </p>
</template>
