<script setup lang="ts">
import AssignmentContent from '@/components/AssignmentContent.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const subjectId = route.params.subjectId as string
const assignmentId = route.params.id as string
</script>

<template>
  <AssignmentContent :subject-id="subjectId" :assignment-id="assignmentId"></AssignmentContent>
</template>
