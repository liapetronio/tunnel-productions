<template>

</template>



<script>

import scatter from './scatter.js';
import * as d3 from "d3";
import * as helpers from '@/js/utils/helpers.js';


export default {
  name: 'ScatterPlot',
  components: {

  },
  data: function () {
    return {
      // pLegendSelections: null,
      plot: null,
      maxDistance: 0.15
    }
  },
  props: {
    rootId: String,
    config: Object,
    data: Array,
    mouseover: String,
    click: Array,
    highlight: Array
  },
  emits: ['update:mouseover', 'update:click', 'update:highlight'],
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
      this.plot = new scatter(self.rootId, self.data, self.config, self.states);
      this.plotMouseEvents(); 
    },
    plotMouseEvents(){
      const self = this;
      const canvas = d3.select(`#${self.plot.rootId}-canvasFocus`)
      const context = canvas.node().getContext('2d');

      let onClick = (event)=>{
        const data = self.plot.data

        const tree = d3.quadtree()
          .x(d=> d.x)
          .y(d=> d.y)
          .extent([[0, 0], [self.plot.dimension.innerWidth, self.plot.dimension.innerHeight] ])
          .addAll(data);

          let mouse = d3.pointer(event);
          let closest = tree.find( self.plot.scale.x.invert(mouse[0]),
          self.plot.scale.y.invert(mouse[1]) );
          let distance;
          if (data.length!=0  && closest!=undefined){
            distance = helpers.euclidDistance(closest.x,closest.y, self.plot.scale.x.invert(mouse[0]), self.plot.scale.y.invert(mouse[1]))
            if (distance <=this.maxDistance){
                this.$emit("update:click",  helpers.updateSelectedArray(self.click, closest.id))
            }
          } else {
            // do nothing!
          }

      }
      let onMouseout = (event)=>{
        this.$emit("update:mouseover", null)
        self.plot.hideTooltip();
      }
      let onMousemove = (event)=>{
    
        const data = self.plot.data;

        const tree = d3.quadtree()
          .x(d=> d.x)
          .y(d=> d.y)
          .extent([[0, 0], [self.plot.dimension.innerWidth, self.plot.dimension.innerHeight] ])
          .addAll(data);

          let mouse = d3.pointer(event);
          let closest = tree.find( self.plot.scale.x.invert(mouse[0]),
          self.plot.scale.y.invert(mouse[1]) );

          if (data.length!=0 && closest!=undefined){
            let distance = helpers.euclidDistance(
              closest.x,closest.y,
              self.plot.scale.x.invert(mouse[0]),
              self.plot.scale.y.invert(mouse[1])
            )
            if (distance <= this.maxDistance){
              this.$emit("update:mouseover", closest.id)
              self.plot.showTooltip(closest, mouse)
            }
            else {
              onMouseout()
            }
          } else {
            // do nothing!
          }
      }
      context.canvas.addEventListener('mousemove', onMousemove );
      context.canvas.addEventListener('click', onClick );
      context.canvas.addEventListener ("mouseout", onMouseout);
  },
    updateCanvasOpacity(){
      let opacity; 
      this.click.length > 0 || this.mouseover ? opacity = 0.65 : opacity = 1; 
      d3.select(`#${this.plot.rootId}-canvasFocus`).style("opacity", opacity)
    }
  },
  watch:{
    mouseover(){
      this.plot.states.mouseover = this.mouseover;
      this.updateCanvasOpacity()
      this.plot.renderSelections();
    },
    click(){
      this.plot.states.click = this.click;
      this.updateCanvasOpacity()
      this.plot.renderSelections();
    },
    highlight(){
      this.plot.states.highlight = this.highlight;
      this.plot.renderPoints();
    },
    data(){

    }
  }
}
</script>
<style scoped>


</style>
