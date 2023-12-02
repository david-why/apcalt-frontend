<script setup lang="ts">
import RestrainCenter from '@/components/layout/RestrainCenter.vue'
import { useLocalStore } from '@/stores'
import { onMounted, onUnmounted } from 'vue'
const store = useLocalStore()

function checkCommand() {
  alert("That's how you use commands!")
}

onMounted(() => {
  store.addCommand('c', checkCommand)
})
onUnmounted(() => {
  store.removeCommand('c', checkCommand)
})
</script>

<template>
  <RestrainCenter>
    <h1>Help</h1>
    <p>
      Welcome to the help page! Here lists all the commands and keyboard shortcuts you can use on
      each page!
    </p>
    <p>
      Each command on this website is a single character, followed by (optionally) the command's
      arguments. To use a command, click the <b>search bar</b> on the top of the screen, and type
      the command (starting with a slash, "/").
      <i>You can also just type "/" anywhere on the page, or just type the command letter!</i> You
      can try the command "/c" on this page.
    </p>
    <p>
      On some pages, there are also <b>keyboard shortcuts</b> that you can use. The list below
      contains them too!
    </p>
    <p>
      Here is a list of all commands and keyboard shortcuts on each page:
      <i>Square brackets denote optional arguments.</i>
    </p>
    <details>
      <summary>Command pro tips</summary>
      <ul>
        
      </ul>
    </details>
    <h2>Any page</h2>
    <ul class="commands">
      <li>
        <code>/a [assigned|upcoming|completed]</code>: Go to the "All assignments" page, optionally
        selecting the given assignment status.
      </li>
    </ul>
  </RestrainCenter>
</template>

<style scoped>
.commands {
  text-align: left;
  width: 100%;
}
</style>
