<script setup lang="ts">
import router from '@/router'
import { useLocalStore, type Suggestion } from '@/stores'
import { ref, watch } from 'vue'
const store = useLocalStore()

const searchInput = ref<HTMLInputElement>()
const suggestionsDiv = ref<HTMLDivElement>()

const focusCounter = ref(0)
const input = ref('')

const suggestions = ref([] as Suggestion[])

async function getSuggestions(): Promise<Suggestion[]> {
  if (input.value === '') {
    return [{ html: 'Start typing to receive search suggestions!' }]
  }
  if (!store.token) {
    return [{ html: 'Please login first!', onclick: () => router.push({ name: 'login' }) }]
  }
  const result = await store.getSuggestions(input.value)
  result.sort((a, b) => b.priority - a.priority)
  return result
}

watch([focusCounter, input], async () => {
  suggestions.value = await getSuggestions()
})

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    searchInput.value?.blur()
  } else if (event.key === 'Enter') {
    if (suggestions.value.length && suggestions.value[0].onclick) {
      suggestions.value[0].onclick()
    }
    searchInput.value?.blur()
    input.value = ''
  }
}

function onFocusSearch() {
  if (!suggestionsDiv.value) return
  suggestionsDiv.value.hidden = false
  focusCounter.value++
}

function onBlurSearch() {
  if (!suggestionsDiv.value) return
  suggestionsDiv.value.hidden = true
}

function onSuggestionClick(suggestion: Suggestion) {
  if (suggestion.onclick) {
    searchInput.value?.blur()
    input.value = ''
    suggestion.onclick()
  }
}

defineExpose({
  focus() {
    searchInput.value?.focus()
  },
  setValue(value: string) {
    input.value = value
  }
})
</script>

<template>
  <div class="search-container">
    <input
      class="search-bar"
      type="text"
      placeholder=">_"
      v-model="input"
      @focus="onFocusSearch"
      @blur="onBlurSearch"
      @keydown="onKeyDown"
      ref="searchInput"
    />
    <div hidden class="suggestions" ref="suggestionsDiv">
      <div
        class="suggestion"
        v-for="suggestion in suggestions"
        :key="suggestion.html"
        v-html="suggestion.html"
        @mousedown.prevent="onSuggestionClick(suggestion)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
}
.search-bar {
  background-color: var(--color-background-mute);
  border: none;
  width: 100%;
  padding: 0.5em 0.2em;
}
.suggestions {
  position: absolute;
  /* margin: 0 0.5em; */
  /* bottom: 0; */
  margin-top: 3px;
  width: calc(100% - 1em);
  max-height: 200px;
  overflow-y: scroll;
  background-color: var(--color-background-soft);
}
.suggestion {
  padding: 0.5em 1em;
}
.suggestion:hover {
  background-color: var(--color-background-mute);
  cursor: pointer;
}
</style>
