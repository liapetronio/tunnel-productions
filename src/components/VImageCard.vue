<template>
    <v-card
      height="100%"
      width="100%"
    >
      <v-img
        :src='img'

      ></v-img>
  
      <v-card-title>
        {{ title }}
      </v-card-title>
  
    </v-card>
  </template>
  
<script>


export default {
    name: "VImageCard",
    props: {
      title: {
        type: String,
        required: true
      },
      img: {
        type: String,
        required: false
      }

    }
}
</script>

<style scoped>

.v-card__title{
    font-size:1.4em;
    font-weight:300;
    line-height:1.2em;
    word-break:normal;
}


</style>