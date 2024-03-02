<template>
    <div class="">

    </div>
</template>
<script>
import * as d3 from "d3";
export default {
    name: 'NoDataPlot',
    components: {
      
    },

    props: {
      rootId: String,
      config: Object
    },
    computed: {
    },
    mounted(){
      this.render();
    },
    methods: {
      render(){

        const padding = { top:20, right:20, bottom:50, left:50 }
      //  this.config.padding;

        const dimension = {
            width: d3.select(`#${this.rootId}`).node().clientWidth,
            height:  d3.select(`#${this.rootId}`).node().clientHeight,
            innerWidth: d3.select(`#${this.rootId}`).node().clientWidth - padding.left - padding.right,
            innerHeight: d3.select(`#${this.rootId}`).node().clientHeight - padding.top - padding.bottom
        }
        const scale ={
            x:  d3.scaleLinear().domain([0,1]).range([0, dimension.innerWidth]).nice() ,
            y:  d3.scaleLinear().domain([0,1]).range([0, dimension.innerHeight]).nice() 
        }

        const tickPadding = 5;
        const container = d3.select(`#${this.rootId}`)
        // Init Svg
        const svg = container.append('svg')
        .attr('width', dimension.width)
        .attr('height', dimension.height)
        .attr('id', `${this.rootId}-svg`)
        .append('g')
        .attr("id", `${this.rootId}-g`)
        .attr('transform', `translate(${padding.left}, ${padding.top})`);


    

        const y = d3.axisLeft(scale.y) 
            .tickPadding(tickPadding)
            .tickSize(0)
            .tickSizeInner(-dimension.innerWidth)

            svg.append("g")
            .attr("class", "axis y")
            .attr("transform", `translate(0,0)`)
            .call(y)

            const x = d3.axisBottom()
            .scale(scale.x)   
            .tickPadding(tickPadding)
            .tickSize(0)
            .tickSizeInner(-dimension.innerHeight);

            svg.append("g")
            .attr("class", "axis x")
            .attr("transform", `translate(0,${dimension.innerHeight})`)
            .call(x)

            d3.select(`#${this.rootId}-svg`)
                .append("text")
                .attr("class", "axis-title")
                .attr("x", dimension.width/2)
                .attr("text-anchor", "middle")
                .attr("y",  dimension.height)
                .attr("dy", "-1.25em")
                .html(this.config.xAxisTitle)

                d3.select(`#${this.rootId}-svg`)
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", `translate(${0},${ dimension.height/2})rotate(-90)`)
                .attr("dy", "2em")
                .attr("text-anchor", "middle")
                .html(this.config.yAxisTitle)

            svg.selectAll(".tick").selectAll("text").remove();
      },

    },

}
</script>
<style scoped>


</style>