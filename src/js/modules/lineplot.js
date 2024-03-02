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


export default class lineplot {
    constructor(
        config
    ) { 
        this.data = config.data;
        this.title = config.title;
        this.axis = config.axis;
        this.rootId = config.rootId;
        this.dimension = config.dimension; 
        this.padding = config.padding;  
        this.legend = config.legend;  
 
        this.updateDimensions(); 
        this.createScale();
        this.render()
    }
    updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScale(){
        this.scale = {
            x: d3.scaleLog().domain([this.axis.x.min, this.axis.x.max]).range([0, this.dimension.innerWidth]).base(2).nice(),
            y: d3.scaleLinear().domain([this.axis.y.min, this.axis.y.max]).range([this.dimension.innerHeight, 0]).nice()
        }
    }
    render(){
        const self = this;
        d3.select(`#${this.rootId}-g`).remove();

        let svg =  d3.select(`#${self.rootId}`)
            .append("g")
            .attr("id", `${self.rootId}-g`)
            .attr("class", "scatter-plot")
            .attr("transform", `translate(${self.padding.left}, ${self.padding.top})`)

        let series = svg.selectAll(".lineplot-series")
            .data(self.data)
            .enter()
            .append("g")
            .attr("class", "lineplot-series")
            .each(function(d){
             
                let path = d3.groups(d.data, e=> e.x).map(e=>{
                    return{
                        x: e[0],
                        y: d3.mean(e[1], f=> f.y)
                    }
                })
              
            d3.select(this)
                .append("path")
                .datum(path)
                .attr("fill", "none")
                .attr("stroke", d.color)
                .attr("stroke-width", 2)
                .attr("stroke-opacity", .75)
                .attr("d", 
                    d3.line()
                        .x(function(e) { 
                            return self.scale.x(e.x) 
                        })
                        .y(function(e) { 
                        return self.scale.y(e.y) 
                        })
                        .curve(d3.curveNatural)
                )
            d3.select(this).selectAll("circle")
                .data(d.data)
                .enter()
                .append("circle")
                .attr("class", "lineplot-pt")
                .attr("fill", d.color)
                .attr("r", e=>e.r)
                .attr("cx", e=> self.scale.x(e.x))
                .attr("cy", e=> self.scale.y(e.y))
                .attr("fill-opacity", .5)
                .attr("stroke", d.color)

        
            })
            .on("mouseover", function(event, d){
                d3.select(this).classed("mouseover", true).moveToFront()
                    .selectAll("circle")
                    .attr("r", (e=> e.r*1.5))

                d3.select(this).append("text").html(d.name)
                    .attr("x", d=> self.scale.x(d.data[`${d.data.length - 1}`].x) + 10)
                    .attr("y", d=> self.scale.y(d.data[`${d.data.length - 1}`].y))
                    .attr("dy", "6px")
                    .attr("class","lineplot-series-label")
       
            })
            .on("mouseleave", function(event, d){
                
                svg.selectAll(".mouseover").classed("mouseover", false)
                    .selectAll("circle")
                    .attr("r", (e=> e.r))
                

                    svg.selectAll(".lineplot-series-label").remove()

            })

            self._axis()
            self._title()

            if (self.legend.display == true){
                self._legend()
            }
            

    }

    _axis(){
        const self = this;
        const svg = d3.select(`#${this.rootId}-g`),
        tickPadding = 8;

        let xTicks = self.axis.x.tickValues;
        const renderAxisX=()=>{
            const x = d3.axisBottom()
                .scale(self.scale.x)   
               .tickValues(xTicks)
                .tickPadding(tickPadding)
                .tickSize(0)
                .tickSizeInner(-self.dimension.innerHeight);

                svg.append("g")
                .attr("class", "axis axis x")
                .attr("transform", `translate(0,${self.dimension.innerHeight})`)
                .call(x)
                .selectAll("text")
                .html((d)=>round(d, 1))
                .attr("text-anchor", "end")
                .attr("transform", "translate(-5, 0)rotate(-30)")


                svg.append("text")
                    .attr("class", "axis title")
                    .attr("x", self.dimension.innerWidth/2)
                    .attr("y",  self.dimension.innerHeight + (self.padding.bottom))
                    .attr("text-anchor", "middle")
                    .html(self.axis.x.title)
            
        }
        const renderAxisY=()=>{
            const y = d3.axisLeft(self.scale.y) 
                .ticks(5) 
                .tickPadding(tickPadding)
                .tickSize(0)
                .tickSizeInner(-self.dimension.innerWidth)

            svg.append("g")
                .attr("class", "axis axis y")
                .attr("transform", `translate(0,0)`)
                .call(y)
            
            svg.append("text")
                .attr("class", "axis title")
                .attr("transform", `translate(${-self.padding.left},${ self.dimension.innerHeight/2})rotate(-90)`)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .html(self.axis.y.title)

        }
        renderAxisX()
        renderAxisY()
    }
    _title(){
        const self = this;
        const svg = d3.select(`#${self.rootId}-g`)
        svg
            .append("text")
            .attr("class", "title")
            .attr("transform", `translate(${self.dimension.innerWidth/2}, 0)`)
            .attr("dy", -14)
            .attr("text-anchor", "middle")
            .html(this.title)
    }
    // this should be custom code, not part of line plot (unless it is given a config)
    _legend(){

        const self = this;
        const svg = d3.select(`#${self.rootId}-legend`)
        const padding = { top: 20, right: self.padding.right, bottom: 50, left: self.padding.left}
        const dimension =  {
            innerWidth: svg.node().clientWidth - padding.left - padding.right,
            innerHeight: svg.node().clientHeight - padding.top - padding.bottom
        }

        let scale = d3.scaleBand().domain(self.legend.scale.domain()).range([0, dimension.innerWidth]).padding(.1)
        let legend = svg.append("g").attr("id", "legend").attr("transform", `translate(${padding.left}, ${[padding.top]})`)


        legend.selectAll("rect")
            .data(self.legend.scale.domain())
            .enter()
            .append("rect")
            .attr("x", d=> scale(d))
            .attr("y", 0)
            .attr("width", scale.bandwidth())
            .attr("height", dimension.innerHeight)
            .attr("fill", d=> self.legend.scale(d))

        const x = d3.axisBottom()
        .scale(scale)   
        .tickPadding(5)
        .tickSize(0)

        legend.append("g")
        .attr("class", "axis axis x")
        .attr("transform", `translate(0,${dimension.innerHeight})`)
        .call(x)

        legend.append("text")
            .attr("class", "axis title")
            .attr("x", dimension.innerWidth/2)
            .attr("y",  dimension.innerHeight)
            .attr("dy", "2.5em")
            .attr("text-anchor", "middle")
            .html(self.legend.title)
    
        legend.select(".domain").remove()

    }
}

// function round(input) {

//     if(input == 0)
//        return input;

//     let precision = 0;
//     let val = input - Math.round(input,0);
//     while (Math.abs(val) < 1)
//     {
//         val *= 10;
//         precision++;
//     }
//     return Math.round(input, precision);
// }

function round(n, what) {
    var i = 0;
    if (n < 1) {
        while(n < 1) {
            n = n*10;
            i++;
        }
    }
    return '0.' + (new Array(i)).join('0') + n.toFixed(what).replace('.','').slice(0,-1);
}