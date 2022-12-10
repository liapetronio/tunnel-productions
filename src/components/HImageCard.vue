<template>
       <v-card
            light
            :to="to"
            :href="href"
            height="100%"
          >
            <div class="d-flex flex-no-wrap align-center">
                <v-avatar
                size="80"
                tile
                >
                    <v-img :src="img"></v-img>
                </v-avatar>
                <div class="card-text">
                    <v-card-title>
                        {{ title }}    
                        <v-icon :icon="icon" >east</v-icon>
                    </v-card-title>
                    <v-card-text v-text="description"></v-card-text>
                </div>
            </div>
        </v-card>

</template>

<script>


export default {
    name: "HImageCard",
    props: {
        title: {
        type: String,
        required: true
        },
        description: {
        type: String,
        required: false
        },
        img: {
        type: String,
        required: false
        },
        icon: {
            type: String,
            required: false
        },
        to:{
            type:String,
            required: false
        },
        href:{
            type:String,
            required: false
        }

    }
}
</script>

<style scoped>

.v-sheet.v-card {
    border-radius: 0px;
}
.row{
  --bs-gutter-x: 0;
  --bs-gutter-y: 0;
}
.v-card__title{
    font-size:1.4em;
    font-weight:300;
    line-height:1.2em;
    word-break:normal;
}
a{
    color:black !important;
}
a:hover, a:hover>*{
    color:#5e8eff;
    background-color:white !important;
}

.v-icon{
    color:#5e8eff;
    padding-left:.25em;
}

</style>