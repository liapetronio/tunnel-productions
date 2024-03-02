import * as d3 from "d3";
// import $ from "jquery";

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

  d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};


export default class scatter {
    constructor(
        config
    ) { 
        this.data = config.data;
        this.title = config.title;
        this.axis = config.axis;
        this.rootId = config.rootId;
        this.dimension = config.dimension; 
        this.padding = config.padding;    
    
        this.updateDimensions(); 
        this.createScale();
        this.render()
    }
    updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScale(){
        if (!this.axis.x){
            this.axis.x = { },
            this.axis.y = { }
        }

        const getExtent = (attr)=>{
            let max, min;
            if (this.axis[`${attr}`].max == undefined){
                max = d3.max(this.data.map(d=>d[`${attr}`]))
            } else {
                max = this.axis[`${attr}`].max
            }
            if (this.axis[`${attr}`].min == undefined){
                min = d3.min(this.data.map(d=>d[`${attr}`]))
            } else {
                min = this.axis[`${attr}`].min
            }
            return [min, max]
        }

        this.scale = {
            x: d3.scaleLinear().domain(getExtent("x")).range([0, this.dimension.innerWidth]).nice(),
            y: d3.scaleLinear().domain(getExtent("y")).range([this.dimension.innerHeight, 0]).nice()
        }
    }
    render(){
        const scale = this.scale;
        d3.select(`#${this.rootId}-g`).remove()


        let svg =  d3.select(`#${this.rootId}`)
            .append("g")
            .attr("id", `${this.rootId}-g`)
            .attr("class", "scatter-plot")
            .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`)

        let scatterPt = svg.selectAll(".scatter-pt")
        .data(this.data)

        scatterPt.exit().remove()
        scatterPt
            .enter()
            .append("g")
            .merge(scatterPt)
            .attr("class", "scatter-pt")
            .attr("transform", d=> `translate(${ this.scale.x(d.x)}, ${ this.scale.y(d.y)})`)
            .each(function(d){
                d3.select(this).append("circle")
                .attr("r", d=>d.r)
                .attr("fill", d=>d.color)
                .attr("stroke", d=>d.color)
                .attr("fill-opacity", .5)
            })

        // let scatterPt = svg.selectAll(".scatter-pt")
        //     .data(this.data)

        // scatterPt.exit().remove()
        // scatterPt
        //     .enter()
        //     .append("circle")
        //     .merge(scatterPt)
        //     .attr("class", "scatter-pt")
        //     .attr("cx", d=> this.scale.x(d.x))
        //     .attr("cy", d=> this.scale.y(d.y))
        //     .attr("r", d=>d.r)
        //     .attr("fill", d=>d.color)
        //     .attr("stroke", d=>d.color)
        //     .attr("fill-opacity", .5)

        // svg.append("text").attr("class", "tooltip")

        this._axis()
        this._title()

    }
    // filter(filtered){
    //     let scatterPt = d3.select(`#${this.rootId}-g`).selectAll(".scatter-pt")
    //     scatterPt.classed("click", false)
    //     scatterPt.filter(d=> !filtered.includes(d._info.id)).classed("inactive", true)
    //     scatterPt.filter(d=> filtered.includes(d._info.id)).classed("inactive", false).moveToFront()
    // }
    // click(clicked){
    //     let scatterPt = d3.select(`#${this.rootId}-g`).selectAll(".scatter-pt")
    //     scatterPt.classed("click", false)
    //     scatterPt.filter(d=>clicked.includes(d._info.id)).classed("click", true).moveToFront()  
    // }
    _axis(){
        const svg = d3.select(`#${this.rootId}-g`),
        tickPadding = 15;

        const renderAxisX=()=>{
            const x = d3.axisBottom()
                .scale(this.scale.x)   
                .ticks(5)
                .tickPadding(tickPadding)
           //     .tickSize(-this.dimension.innerHeight)
                .tickSize(0)
               .tickSizeInner(-this.dimension.innerHeight);

                svg.append("g")
                .attr("class", "axis axis x")
                .attr("transform", `translate(0,${this.dimension.innerHeight})`)
                .call(x)

                svg.append("text")
                    .attr("class", "axis title")
                    .attr("x", this.dimension.innerWidth/2)
                    .attr("y",  this.dimension.innerHeight + (this.padding.bottom))
                    .attr("text-anchor", "middle")
                    .html(this.axis.x.title)
            
        }
        const renderAxisY=()=>{
            const y = d3.axisLeft(this.scale.y) 
                .ticks(5) 
                .tickPadding(tickPadding)
                .tickSize(0)
                .tickSizeInner(-this.dimension.innerWidth)

            svg.append("g")
                .attr("class", "axis axis y")
                .attr("transform", `translate(0,0)`)
                .call(y)
            
            svg.append("text")
                .attr("class", "axis title")
                .attr("transform", `translate(${-this.padding.left},${ this.dimension.innerHeight/2})rotate(-90)`)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .html(this.axis.y.title)

        }
        renderAxisX()
        renderAxisY()
    }
    _title(){
        const svg = d3.select(`#${this.rootId}-g`)
        svg
            .append("text")
            .attr("class", "title")
            .attr("transform", `translate(${this.dimension.innerWidth/2}, 0)`)
            .attr("dy", -14)
            .attr("text-anchor", "middle")
            .html(this.title)
    }
}

