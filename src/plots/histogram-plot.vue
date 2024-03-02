<template>
    <div :id="rootId" class="histogram-plot">

    </div>
</template>
<script>
import histogram from './histogram.js';

export default {
    name: 'HistogramPlot',
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
        this.chart = new histogram(self.rootId, self.data, self.config, self.states);
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