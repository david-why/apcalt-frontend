<script setup lang="ts">
import CenterContent from './CenterContent.vue'
import RestrainWidth from './RestrainWidth.vue'
</script>

<template>
  <RestrainWidth>
    <CenterContent>
      <slot></slot>
    </CenterContent>
  </RestrainWidth>
</template>
