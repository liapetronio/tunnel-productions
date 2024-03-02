<template>
    <div class="">

    </div>
</template>



<script>
import scatter from '@/js/modules/scatter-2.0.js';
import * as d3 from "d3";
import * as helpers from '@/js/utils/helpers.js';

export default {
    name: 'PlotTooltip',
    components: {
      
    },
    data: function () {
      return {

      }
    },
    props: {
      info: String
    },
    computed: {
    },
    mounted(){
      const self = this;

   
    },
    methods: {
    // use component for tooltip with tooltipConfig input
    // each plot will import component
    showTooltip(self, point, mouse){
        const tooltip = d3.select(`#${self.rootId}-tooltip`);
        tooltip
        .html(`${point.label}<br>${self.axis.x.title}: ${point.x}<br>${self.axis.y.title}: ${point.y}`)
        .style(`top`, `${mouse[1]-(12*6)}px`) 
        .style(`left`, `${mouse[0] }px`)
    
        tooltip.transition().duration(100).style("opacity", 1)
    },
    hideTooltip(self){
        const tooltip = d3.select(`#${self.rootId}-tooltip`);
        tooltip.transition().duration(100).style("opacity", 0)
    } 
     
    },
    watch:{

    }
}
</script>
<style>

</style>