<template>
    <v-app-bar
      app
      color="#000000"
      elevation="0"
    >       
      <v-tabs
        background-color="#000000"
        dark
        active-class="active_tab"
        v-model="active_tab"
        align-with-title
      >
        <v-tab :ripple="false" id="home-tab" key="home" to="/">
            <v-img
              alt="Logo"
              class="shrink mr-2 logo-image"
              src="images/logo.png"
              transition="scale-transition"
            />
        </v-tab>
      <v-tab to="/minecraft">
        Minecraft Map
      </v-tab>
        <v-spacer></v-spacer>

          <v-tab :ripple="false" key="experiments" to="/experiments">Experiments</v-tab>
          <v-menu 
          dark
          offset-y>
            <template v-slot:activator="{ on, attrs }">
              <div
                :ripple="false"
                v-bind="attrs"
                v-on="on"
                class="v-tab"
                id="media-tab"
              >
              Media <span class="material-icons">keyboard_arrow_down</span>
            </div>
            </template>
            <v-list>
              <v-list-item class="v-tab" to="/music">Music</v-list-item>
              <v-list-item  class="v-tab" to="/video">Video</v-list-item>
            </v-list>
          </v-menu>
    
          <v-tabs-slider color="#000000"></v-tabs-slider>
        </v-tabs>


  </v-app-bar>
</template>

<script>


export default {
  name: "NavigationBar",
  data () {
      return {
        active_tab: "home"
       }
    },
    methods: {
    }
};
</script>


<style scoped>
  .v-tab{
    color: white!important;
    text-transform: none;
    font-weight:500;
  }
.v-list{
  background-color:#000000;
}

.logo-image{
  max-width:150px !important;
}
.active_tab{
    font-weight:900;
    /* color:#5e8eff !important; */
  }

  a:hover, #media-tab:hover{
    font-weight:900;
    background-color:black !important;
  }
  a {
    color: white !important;
  }
  #home-tab:hover{
    font-weight:900;
    background-color:#000000 !important;
  }
  .v-tab::before {
  display: none;
}

</style>