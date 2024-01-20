<script setup lang="ts">
import AssignmentContent from '@/components/AssignmentContent.vue'
import ScoringRubricContent from '@/components/ScoringRubricContent.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const subjectId = route.params.subjectId as string
const assignmentId = route.params.id as string
</script>

<template>
  <div class="scoring-view">
    <div class="column assignment">
      <AssignmentContent
        :subject-id="subjectId"
        :assignment-id="assignmentId"
        :mode="2"
        hide-title
      ></AssignmentContent>
    </div>
    <div class="separator"></div>
    <div class="column rubric">
      <ScoringRubricContent
        :subject-id="subjectId"
        :assignment-id="assignmentId"
      ></ScoringRubricContent>
    </div>
  </div>
</template>

<style scoped>
.scoring-view {
  position: fixed;
  top: 3rem;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}
.separator {
  flex: 0 0 10px;
}
.column {
  height: 100%;
  overflow-y: scroll;
  flex: 1 0 0;
  padding: 0.5em;
}
</style>
