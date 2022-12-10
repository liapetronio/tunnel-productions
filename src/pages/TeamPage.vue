<template>
  <v-container class="v-spacer">
        <h2>Projects</h2>

        <v-row class="v-spacer">
          <v-card v-for="(item, i) in items"
              :key="i"
              height="100%"
              width="100%"
              class="team-card"
            >
              <v-img
                :src='item.src'
              ></v-img>
          
              <v-card-title>
                {{ item.name }} 
              </v-card-title>
          
              <v-card-text>
                {{ item.title }}
              </v-card-text>
            </v-card>
        </v-row>

    </v-container>
</template>

<script>


export default {
  name: 'TeamPage',
  data () {
        return {
          items: [
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'},
                {name:"First Last Name", title: "Position Title", src:'images/team/unnamed.jpg'}
          ],
          displayCompoundReport: true
        }
      },
};
</script>
<style scoped>
.team-card{
  width:18%!important;
  margin: 0 16px 16px 0;
}
.team-card > .v-card__title{
    font-size:1.2em;
    font-weight:500;
    line-height:1.2em;
    word-break:normal;   
    padding-bottom:4px !important;

}
.team-card > .v-card__text{
    font-size:1em;
    font-weight:500;
    line-height:1.2em;
    word-break:normal;   
    margin:0px !important;
}



@media (max-width: 550px) {
  .team-card{
    width:45%!important;
    margin: 8px;
  }
}

</style>