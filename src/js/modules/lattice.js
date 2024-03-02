
import * as d3 from "d3";
import scatter from '../../plots/scatter.js';



export default class lattice {
    constructor(
        data,
        rootId,
        dimension = { width: undefined, height:undefined},
        padding={top: 50, right: 0, bottom:50, left:0},
    ) {

        this.data = data;
        this.rootId = rootId;
        if (dimension.width == undefined){
            dimension.width = d3.select(`#${rootId}`).node().clientWidth;
        }
        if (dimension.height == undefined){
            dimension.height = d3.select(`#${rootId}`).node().clientHeight;
        }

        this.dimension = dimension;
        this.padding = padding;
        this.updateDimensions();
        this.createScale();
        this.render();
   
    }

    updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScale(){
        this.scale = {
            x: d3.scaleBand().domain([...new Set(this.data.map(d=>d.column))]).range([0, this.dimension.innerWidth]),
            y: d3.scaleBand().domain([...new Set(this.data.map(d=>d.row))]).range([this.dimension.innerHeight, 0])
        }
    }
    render(){
        const self = this;
     
        let plots = d3.select(`#${self.rootId}`).selectAll(".lattice-plot")
            .data(self.data)
            .enter()
            .append("div")
            .attr("class", "lattice-plot")
            .attr("id", d=>`plot-${d.row}-${d.column}`)
            .style("position", "absolute")
            .style("left", d=>`${self.scale.x(d.column)}px`)
            .style("top", d=>`${self.scale.y(d.row)}px`)
            .style("width",`${self.scale.x.bandwidth()}px`)
            .style("height",`${self.scale.y.bandwidth()}px`)
            .each(function(d){
             //s   d3.select(this).datum(d);
                d3.select(this).append("text").html("hi")
              //  new scatter(d.data, this.id, {width: self.scale.x.bandwidth(), height: self.scale.y.bandwidth()}, {top:0, right:0, bottom:0, left:0});
            })

    }
}


