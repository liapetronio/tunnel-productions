<template>

</template>
<script>

import barplot from './barplot.js';

export default {
    name: 'BarPlot',
    components: {
      
    },
    data: function () {
      return {
        chart: null
      }
    },
    props: {
      rootId: String,
      config: Object,
      data: Array,
      highlight: Array
    },
    computed: {
      states(){
        return {
          mouseover: this.mouseover,
          click: this.click,
          highlight: this.highlight
        }
      }
    },
    mounted(){
      this.configPlot();
    },
    methods: {
      configPlot(){
        const self = this;
        this.chart = new barplot(self.rootId, self.data, self.config, self.states);
      },
    },
    watch:{
      data(){
        this.chart.data = this.data;
        this.chart.update();
      }
    }
}
</script>
<style scoped>

</style>