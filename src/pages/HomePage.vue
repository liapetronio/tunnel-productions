<template>
    <div>
      <div class="banner">
        <v-container>
          <h1>Tunnel Productions</h1>
          <button class="lg" to="/">Roam<span class="material-icons">east</span></button>
        </v-container>
      </div>

      <v-container>
        <v-row>

        </v-row>


      </v-container>    
    </div>
</template>
<script>


export default {
  name: 'Homepage'
};
</script>
<style scoped>


.banner{
  background-image: url("../../public/images/banner.png");
  width:101%;
  color:white;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding:60px 0px 72px 0px;
  margin:0;
}

.banner>* h1{
  color:white;
  font-weight:900;
  font-size:3.6em;
}

.banner > .container >* {
  max-width:50%;
  margin-left:0px;
}



@media (max-width: 550px) {
  .banner > .container >* {
    max-width:100%;
    margin-left:0px;
  }
}

</style>