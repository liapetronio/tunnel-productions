<template>
  <v-app>
    <NavigationBar></NavigationBar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';
export default {
  name: 'App',
  components: {
    NavigationBar
  }
};
</script>
<style>


</style>