<script setup>
import service from '../util/request'
import strftime from '../util/strftime'
import { useGlobalStore } from '../util/storage'
import { router } from '../router'
import { getProgress } from '../util/assignment'
</script>

<script>
export default {
  data() {
    return {
      store: useGlobalStore(),
      assignmentStatus: 'assigned',
      subjects: null,
      subject: null,
      assignments: null,
      subjectChange: this.$route.params.id
    }
  },
  methods: {
    async refreshAssignments() {
      this.assignments = null
      this.assignments = (
        await service.get(
          '/subjects/' + this.subject.id + '/assignments?status=' + this.assignmentStatus
        )
      ).data
    },
    changeSubject() {
      router.replace({ path: '/subjects/' + this.subjectChange })
    },
    async startAssignment(assignment) {
      this.assignments = null
      await service.post(
        '/subjects/' + this.subject.id + '/assignments/' + assignment.id + '/start'
      )
      await this.refreshAssignments()
    }
  },
  async mounted() {
    this.subjects = await this.store.getSubjects()
    for (const subject of this.subjects) {
      if (subject.id === this.$route.params.id) {
        this.subject = subject
      }
    }
    if (this.subject === null) {
      router.push({ path: '/' })
    }
    await this.refreshAssignments()
  }
}
</script>

<template>
  <p v-if="subject === null">Loading, please wait...</p>
  <div v-else>
    <div>
      <!-- <label for="subjectChange">Change subject</label>
      &nbsp; -->
      <select class="hugetext" v-model="subjectChange" id="subjectChange" @change="changeSubject">
        <option
          v-for="subject in subjects"
          :key="subject.id"
          :value="subject.id"
          v-text="subject.name"
        ></option>
      </select>
    </div>
    <!-- <h1 v-text="subject.name"></h1> -->
    <div>
      <label for="assignmentStatus"><b>Status</b></label>
      &nbsp;
      <select v-model="assignmentStatus" id="assignmentStatus" @change="refreshAssignments">
        <option value="assigned">Assigned</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
      </select>
      &nbsp;
      <span class="button" @click="refreshAssignments">⟳</span>
    </div>
    <!-- <textarea rows=50 cols=50 v-text="assignments"></textarea> -->
    <p v-if="assignments == null">Loading assignments, please wait...</p>
    <table v-else-if="assignments.length !== 0" class="assignments">
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Due at</th>
        <th>Actions</th>
      </tr>
      <tr v-for="assignment in assignments" :key="assignment.id">
        <td v-text="assignment.title"></td>
        <td v-text="getProgress(assignment)"></td>
        <td>
          <time
            v-if="assignment.due_at !== null"
            v-text="strftime('%Y-%m-%d %H:%M:%S', new Date(assignment.due_at))"
            :datetime="assignment.due_at"
          ></time>
          <span v-else>-</span>
        </td>
        <td
          class="actions"
          v-if="assignment.type === 'teacher-authored' || assignment.type === 'ppc'"
        >
          <RouterLink
            v-if="assignment.progress.started"
            :to="'/subjects/' + subject.id + '/assignments/' + assignment.id"
          >
            Continue
          </RouterLink>
          <a
            href="javascript:;"
            @click="startAssignment(assignment)"
            v-if="assignment.progress.not_started"
          >
            Start
          </a>
          <RouterLink
            v-if="
              assignment.progress.complete ||
              assignment.progress.student_scored ||
              assignment.progress.teacher_and_student_scored
            "
            :to="'/subjects/' + subject.id + '/assignments/' + assignment.id + '/review'"
          >
            Review
          </RouterLink>
        </td>
        <td class="actions" v-else-if="assignment.type === 'video'">
          <RouterLink :to="'/subjects/' + subject.id + '/videos/' + assignment.resource_id"
            >Watch</RouterLink
          >
        </td>
        <td v-else></td>
      </tr>
    </table>
    <p v-else>No assignments yet!</p>
  </div>
</template>

<style scoped>
.hugetext {
  font-size: 2em;
  font-weight: bold;
}
th {
  font-weight: bold;
  text-align: left;
}
.actions {
  display: flex;
}
.actions > * {
  padding: 0 0.5em 0 0;
}
.assignments {
  width: 95%;
}
.button {
  cursor: pointer;
  font-size: 1.2em;
}
</style>
