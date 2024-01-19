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
    <div class="column">
      <!-- <div class="assignment"> -->
      <AssignmentContent
        :subject-id="subjectId"
        :assignment-id="assignmentId"
        :mode="2"
        hide-title
      ></AssignmentContent>
    </div>
    <div class="separator"></div>
    <!-- </div> -->
    <div class="column">
      <!-- <div> -->
      <ScoringRubricContent
        :subject-id="subjectId"
        :assignment-id="assignmentId"
      ></ScoringRubricContent>
      <!-- </div> -->
    </div>
  </div>
</template>

<style scoped>
.scoring-view {
  display: flex;
  height: 100%;
}
.separator {
  flex: 0 0 10px;
}
.column {
  height: 100%;
  flex: 1 0 0;
}
.assignment {
  width: 100%;
  height: 100%;
}
</style>
