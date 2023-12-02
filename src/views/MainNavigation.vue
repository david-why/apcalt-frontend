<script setup lang="ts">
import { useLocalStore } from '@/stores'
import { logout } from '@/service'
import router from '@/router'
import { ref } from 'vue'
import SearchComponent from '@/components/SearchComponent.vue'
const store = useLocalStore()

const search = ref()

function doLogout() {
  logout()
  router.push({ name: 'home' })
}

defineExpose({
  focusSearch() {
    search.value.focus()
  },
  setSearchValue(value: string) {
    search.value.setValue(value)
  }
})
</script>

<template>
  <header class="main-nav">
    <div class="main-nav-links">
      <span class="main-nav-title" @click="$router.push({ name: 'home' })">APCAlt</span>
      <span @click="$router.push({ name: 'assignments' })">Assignments</span>
      <span @click="$router.push({ name: 'subjects' })">Subjects</span>
    </div>
    <!-- <div class="search-container">
      <input class="search-bar" type="text" placeholder=">_" @focus="onFocusSearch" @blur="onBlurSearch" />
      <div hidden class="suggestions" ref="suggestionsDiv">
        <div v-for="suggestion in suggestions" :key="suggestion" v-html="suggestion"></div>
      </div>
    </div> -->
    <div class="main-nav-search">
      <SearchComponent ref="search"></SearchComponent>
    </div>
    <div class="main-nav-user">
      <span @click="doLogout" v-if="store.token">Logout</span>
      <span v-else-if="store.loggingIn">Logging in...</span>
      <span @click="$router.push({ name: 'login' })" v-else>Login</span>
    </div>
  </header>
</template>

<style scoped>
.main-nav {
  background-color: var(--color-background-soft);
  display: flex;
  align-items: center;
}
.main-nav-links {
  display: flex;
  align-items: center;
}
.main-nav span {
  height: 100%;
  padding: 0.5em;
  cursor: pointer;
}
.main-nav span:hover {
  background-color: var(--color-background-mute);
}
.main-nav-title {
  font-size: 1.2em;
  font-weight: bold;
}
.main-nav-search {
  flex: 1 0 0;
}
@media screen and (max-width: 400px) {
  .main-nav {
    display: grid;
    grid-template-rows: 3fr 2fr;
    grid-template-areas: "links user" "search search";
  }
  .main-nav-links {
    grid-area: links;
  }
  .main-nav-user {
    grid-area: user;
  }
  .main-nav-search {
    grid-area: search;
  }
}
/* .search-container {
  flex: 1 0 0;
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
  margin-top: 3px;
  padding: 1em;
  width: calc(100% - 1em);
  background-color: var(--color-background-soft);
} */
</style>
