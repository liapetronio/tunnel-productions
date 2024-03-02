<template>
    <div class="">

    </div>
</template>
<script>
import parallelcoordinate from './parallelcoordinate.js';
import * as d3 from "d3";
import * as helpers from '@/js/utils/helpers.js';
const maxDistance = 0.0075;
export default {
    name: 'ParallelCoordinatePlot',
    components: {
      
    },
    data: function () {
      return {
        pLegendSelections: null,
        plot: null
      }
    },
    props: {
      rootId: String,
      config: Object,
      data: Array,
      mouseover: String,
      click: Array,
      highlight:Array,
      multiSelect: Boolean
    },
    computed: {
      selectmulti(){
        if (this.multiSelect!=undefined){
          return this.multiSelect
        } else {
          return true
        }
      },
      states(){
        return {
          mouseover: this.mouseover,
          click: this.click,
          highlight: { color: null, series: null}
        }
      }
    },
    mounted(){
      this.configPlot();
    },
    methods: {
      configPlot(){
        const self = this;
        this.plot = new parallelcoordinate(self.rootId, self.data, self.config, self.states);
        this.plotMouseEvents();

        if (this.config.display.legend){
          this.plotLegendEvents();
        }
      },

      plotMouseEvents(){
        const self = this;
        const canvas = d3.select(`#${self.plot.rootId}-focus`) 
        const context = canvas.node().getContext('2d');
        let closestParent = null;
        let onClick = (event)=>{

          const tree = d3.quadtree()
            .x(d=> d[0])
            .y(d=> d[1])
            .extent([[0, 0], [self.plot.dimension.innerWidth, self.plot.dimension.innerHeight] ])
           .addAll(self.plot.data.filter(d=>d.highlighted==true || d.selected==true).map(d=>d.path.map(e=>e.points).flat()).flat());

            let mouse = d3.pointer(event);
            let closest = tree.find( self.plot.scale.x.invert(mouse[0]),
            self.plot.scale.y.invert(mouse[1]) );
            let distance;
            if (self.plot.data.length!=0 && closest!=undefined){
              closestParent = self.plot.data.find(d=>d.id == closest[2])
              distance = helpers.euclidDistance(closest[0],closest[1], self.plot.scale.x.invert(mouse[0]), self.plot.scale.y.invert(mouse[1]))
              if (distance <=maxDistance){
                if (self.selectmulti){
                  this.$emit("update:click",  helpers.updateSelectedArray(self.click, closestParent.id))
                } else {
                  this.$emit("update:click", [closestParent.id])
                }
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
          let mouseoverData;
          if (self.click.length==0){
            mouseoverData = self.plot.data.filter(d=>d.highlighted==true)
          } else {
            mouseoverData = self.plot.data.filter(d=>d.selected==true)
          }
          if (mouseoverData.length==0){
            mouseoverData = self.plot.data.filter(d=>d.highlighted==true)
          }
   

          let closestParent = null,
          closestPath = null;
          const tree = d3.quadtree()
            .x(d=> d[0])
            .y(d=> d[1])
            .extent([[0, 0], [self.plot.dimension.innerWidth, self.plot.dimension.innerHeight] ])
            .addAll(mouseoverData.map(d=>d.path.map(e=>e.points).flat()).flat());

            let mouse = d3.pointer(event);
            let closest = tree.find( self.plot.scale.x.invert(mouse[0]),
            self.plot.scale.y.invert(mouse[1]) );
            if (self.plot.data.length!=0 && closest!=undefined){
              
              closestParent = self.plot.data.find(d=>d.id == closest[2]) // return 1 obj
              closestPath = self.plot.data.find(d=> d.tooltip_id == closest[3]) // returns array of 1
              let distance = helpers.euclidDistance(
                closest[0],closest[1],
                self.plot.scale.x.invert(mouse[0]),
                self.plot.scale.y.invert(mouse[1])
              )
              if (distance <= maxDistance){
                this.$emit("update:mouseover", closestParent.id)
                self.plot.showTooltip(closestPath, mouse)
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
    plotLegendEvents(){
        const self = this;
        const legend = d3.select(`#${self.plot.legend.rootId} g`)
        let highlight;
        legend.selectAll(".legend.tick")
          .on("click", function(event, d){
              // if (self.highlight == d.color && self.highlightSeries == d.series){
            if (self.plot.states.highlight.color == d.color && self.plot.states.highlight.series == d.series){
            d3.selectAll(".legend.tick.active").classed("active", false)
            self.plot.states.highlight = { color: null, series: null};
           // self.highlightSeries = null;
            highlight = [];
          } else {
            d3.selectAll(".legend.tick.active").classed("active", false)
            d3.select(this).classed("active", true)
            
           // self.highlightSeries = d.series;
          self.plot.states.highlight = { color: d.color, series: d.series};
          highlight = [d.color]
         
          }
          self.$emit("update:highlight", highlight)
        })
      }
    },
    watch:{
      mouseover(){
        this.plot.states.mouseover = this.mouseover;
        this.plot.renderPaths();
      },
      click(){
        this.plot.states.click = this.click;
        this.plot.renderPaths();
      },
      highlight(){
      //  this.plot.states.highlight = { color: this.highlight, series: this.highlightSeries}; // this is used locally in plot component
        this.plot.renderPaths();
      },
      data(){
        this.plot.data = this.data;
        // this.plot.states.mouseover = this.mouseover;
        // this.plot.states.click = this.click;
        // this.plot.states.highlight.color = this.highlight;
        this.plot.renderPaths();
      }
    }
}
</script>
<style scoped>

.relative-plot-wrapper{
  position:relative;
  width:100%;
  height:100%;
}
#parallelcoordinate-plot-legend{
  width:100%;
}

</style>