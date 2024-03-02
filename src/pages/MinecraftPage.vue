<template>
    <v-container class="px-8">
    <h1>Minecraft Map</h1>
    <div id="map"></div>
    </v-container>
</template>
<script>
  import * as d3 from "d3";

export default {
  name: 'MinecraftPage',
      data () {
        return {
        data: []
        }
      },
      mounted(){
        this.getData()
      },
      methods: {
         getData() {

          Promise.all([
              d3.csv(`data/minecraft.csv`, function(d){
                  return {
                    x: +d["x"],
                    y: +d["y"],
                    name: d["name"]
                  }
              })
            ]).then(response=>{
console.log(response[0])
                this.data = response[0]
                this.renderMap()
          })
        },
        renderMap(){
            console.log("rendering map")
          
            const width = d3.select(`#map`).node().getBoundingClientRect().width;
            const height = width
          //  const height = d3.select(`#map`).node().getBoundingClientRect().height;
            const innerWidth = width - 100;
            const innerHeight = height - 100;
            let xscale = d3.scaleLinear().domain([-2000,2000]).range([0,innerWidth])
            let yscale = d3.scaleLinear().domain([-2000,2000]).range([innerHeight, 0])

        // Init Svg
        const container = d3.select(`#map`).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', `map-svg`)
        .append('g')
        .attr('transform', `translate(50,50)`)
        .attr("id", `map-g`)



     let tickPadding = 2.5;

const y = d3.axisLeft(yscale) 
.ticks(50)
.tickPadding(tickPadding)


container.append("g")
.attr("class", "axis y")
.attr("transform", `translate(0,0)`)
.call(y)

const x = d3.axisBottom()
.scale(xscale)   
.ticks(50)


container.append("g")
.attr("class", "axis x")
.attr("transform", `translate(0,${innerHeight})`)
.call(x)
container.selectAll(".axis.y .tick line").attr("x1", innerWidth);
container.selectAll(".axis.x .tick line").attr("y1", -innerHeight);


        let scatterPt = container.selectAll(".scatter-pt")
        .data(this.data)

        scatterPt.exit().remove()
        scatterPt
            .enter()
            .append("g")
            .merge(scatterPt)
            .attr("class", "scatter-pt")
            .attr("transform", d=> `translate(${ xscale(d.x)}, ${ yscale(d.y)})`)
            .each(function(d){
                d3.select(this).append("circle")
                .attr("r", 5)
                .attr("fill", "white")
                .attr("fill-opacity", .5)

                d3.select(this).append("text")
                .attr("x", 10)
                .attr("y", 5)
                .text(d.name)
                .attr("fill", "white")
                .attr("font-size", 8)
            })
        
            
        } 
      },
      watch: {

      }
    }


</script>
<style>
.tick line{
    stroke: white;
    opacity: .25;
}
.tick text{
    fill: white;
    font-size: 8px !important;
}
    h1{
        text-align:center;
    }
    #map{
        width:100%;
    }
</style>
