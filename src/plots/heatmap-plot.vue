<template>
    <div class="">

    </div>
</template>



<script>
import heatmap from './heatmap.js';
import * as d3 from "d3";
import * as helpers from '@/js/utils/helpers.js';
// import {Legend} from "@d3/color-legend"
const maxDistance = 0.0075;
export default {
    name: 'HeatmapPlot',
    components: {
      
    },
    data: function () {
      return {
        plot: null,
      }
    },
    props: {
      rootId: String,
      config: Object,
      data: Array,
      mouseover: String,
      click: Array,
      multiSelect: Boolean
    },
    computed: {
      selectmulti(){
        if (this.multiSelect){
          return this.multiSelect
        } else {
          return true
        }
      }
    },
    mounted(){
      const self = this;
      this.configPlot();
    },
    methods: {
      configPlot(){
        this.states = {
          mouseover: this.mouseover,
          click: this.click
        }

       this.plot = new heatmap(this.rootId, this.data, this.config, this.states);
       this.plotMouseEvents();
      },
      plotMouseEvents(){
        const self = this;
        const canvas = d3.select(`#${self.plot.rootId}-canvas`)
        const context = canvas.node().getContext('2d');
  
        function scaleBandInvertX(scale, mouse) {
            var step = scale.step();
            var index = Math.floor((mouse / step));
            return scale.domain()[index];
        }

        function scaleBandInvertY(scale, mouse) {
            var step = scale.step();
            var index = Math.floor((mouse / step));
            return scale.domain().reverse()[index];
        }

        let onClick = (event)=>{
            let mouse = d3.pointer(event);
            let x =  scaleBandInvertX(self.plot.scale.x, mouse[0])
            let y = scaleBandInvertY(self.plot.scale.y, mouse[1])
            let closest = self.plot.data.filter(d=> d.x == x && d.y==y)[0]
            if (closest){
              if (self.selectmulti){
                  this.$emit("update:click",  helpers.updateSelectedArray(self.click, closest.id))
                } else {
                  this.$emit("update:click", [closest.id])
                }
            } else {
              // do nothing!
            }
        }
        let onMouseout = (event)=>{
          this.$emit("update:mouseover",null)
          self.plot.hideTooltip();
        }
        let onMousemove = (event)=>{

            let mouse = d3.pointer(event);
            let x =  scaleBandInvertX(self.plot.scale.x, mouse[0])
            let y = scaleBandInvertY(self.plot.scale.y, mouse[1])

            let closest = self.plot.data.filter(d=> d.x == x && d.y==y)[0]
            if (closest){
              this.$emit("update:mouseover", closest.id)
              self.plot.showTooltip(closest, mouse)
            }
            else {
                onMouseout()
            }      
        }

        context.canvas.addEventListener('mousemove', onMousemove );
        context.canvas.addEventListener('click', onClick );
        context.canvas.addEventListener ("mouseout", onMouseout);
    },

    },
    watch:{

      data(){
        const self = this;
        self.plot.data = this.data;
        this.plot.states.mouseover = this.mouseover;
        this.plot.states.click = this.click;
        self.plot.renderPoints();
      }

    }
}
</script>
<style scoped>

</style>