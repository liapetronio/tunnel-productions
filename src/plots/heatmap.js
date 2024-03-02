import * as d3 from "d3";
import defaultPlotConfig from './default-plot-config.js';

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


export default class heatmap extends defaultPlotConfig{
    constructor(
        rootId, 
        data,
        config,
        states
    ) { 
        super(rootId, config);
        let defaults = new defaultPlotConfig(rootId, config);
        Object.assign(defaults.getDefaults(), this );

        this.data = data;
        this.states = states;
        this.createScale();
        this.render();

        if (this.display.legend){ // requires createScale() for setting scale.c 
            this.legend = config.legend;
            this.renderLegend();
        }
    }
    updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScale(){
        const self = this;
        const getxDomain = ()=>{
            if (!this.axis.x.domain){ return [...new Set(this.data.map(d=>d.x))]}
            else { return this.axis.x.domain }
        }
        const getyDomain = ()=>{
            if (!this.axis.y.domain){ return [...new Set(this.data.map(d=>d.y))]}
            else { return this.axis.y.domain }
        }
        const getcDomain = ()=>{
            if (!this.axis.c.domain){ return [...new Set(this.data.map(d=>d.c))]}
            else { return this.axis.c.domain }
        }
        const getColorScale = ()=>{
            if (this.axis.c.type == "sequential"){
                return d3.scaleSequential().domain(d3.extent(getcDomain())).interpolator(d3.interpolateYlOrRd)
            } else if (this.axis.c.type == "linear"){
                return d3.scaleLinear().domain(d3.extent(getcDomain())).range(this.axis.c.range)
            } else if (this.axis.c.type == "ordinal"){
                return d3.scaleOrdinal().domain(getcDomain()).range(this.axis.c.range) 
            }
        }

        if (!this.scale.x){ this.scale.x = d3.scaleBand().domain(getxDomain()).range([0, this.dimension.innerWidth]).padding(0); }
        if (!this.scale.y){ this.scale.y = d3.scaleBand().domain(getyDomain()).range([this.dimension.innerHeight, 0]).padding(0);}
      //  if (!this.scale.c){ this.scale.c = d3.scaleSequential().domain(getcDomain()).interpolator(d3.interpolateYlOrRd)}
        if (!this.scale.c){ this.scale.c = getColorScale(); }
    }
    render(){
        const self = this;
        const container = d3.select(`#${self.rootId}`)

        // Init Svg
        container.append('svg')
        .attr('width', self.dimension.width)
        .attr('height', self.dimension.height)
        .attr('id', `${self.rootId}-svg`)
        .attr("class", "plot-svg")
        .style("position", "absolute")
        .style("top", "0px")
        .style("left", "0px")
        .append('g')
        .attr("id", `${self.rootId}-g`)
        .attr("class", "plot-g")
        .attr('transform', `translate(${self.padding.left}, ${self.padding.top})`);

        // Init Canvas
        container.append('canvas')
        .attr('width', self.dimension.innerWidth)
        .attr('height', self.dimension.innerHeight)
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-canvas")
        .style("position", "absolute")
        .style("top", "0px")
        .style("left", "0px")
        .attr('id', `${self.rootId}-canvas`);

        // Init tooltip
        container.append('div')
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-tooltip")
        .attr('id', `${self.rootId}-tooltip`);
        this.hideTooltip()
    
        this.renderPoints()
        this.renderAxis()
        if (this.display.title){  this.renderTitle() }
      
    }
    renderPoints(){
        const self = this;

        const canvas = d3.select(`#${self.rootId}-canvas`)
        const context = canvas.node().getContext('2d');
        context.clearRect(0, 0, self.dimension.innerWidth, self.dimension.innerHeight);

        self.data.forEach(point => {
            context.save()
            context.globalAlpha = 1;
            context.beginPath();
            context.strokeStyle = "white";
            context.fillStyle = self.scale.c(point.c);
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  10;
            context.rect(px, py, self.scale.x.bandwidth(), self.scale.y.bandwidth())
            context.fill();
           context.stroke();
           context.restore();
        });
        self.data.filter(d=> self.states.click.includes(d.id)).forEach(point => {
            context.save()
            context.globalAlpha = 1;
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = "black";
            context.fillStyle = self.scale.c(point.c);
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  10;
            context.rect(px, py, self.scale.x.bandwidth(), self.scale.y.bandwidth())
            context.fill();
           context.stroke();
           context.restore();
        });

        self.data.filter(d=> self.states.mouseover == d.id).forEach(point => {
            context.save()
            context.globalAlpha = 1;
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = "black";
            context.fillStyle = self.scale.c(point.c);
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  10;
            context.rect(px, py, self.scale.x.bandwidth(), self.scale.y.bandwidth())
            context.fill();
           context.stroke();
           context.restore();
        });

    }
    renderPoint(points, mouseEvent){

        const self = this;
        let plot = d3.select(`#${self.rootId}-g`)    
        let rect = plot.selectAll(`.${mouseEvent}`)
           .data(points)
      
           rect.exit().remove()
       
           rect.enter().append("rect")
            .merge(rect)
            .attr("x", d=>self.scale.x(d.x))
            // .attr("y", d=>self.dimension.innerHeight - self.scale.y(d.y))
            .attr("y", d=>self.scale.y(d.y))
            .attr("width",d=>self.scale.x.bandwidth())
            .attr("height",d=>self.scale.y.bandwidth())
            .attr("fill", d=> self.scale.c(d.c))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("class", mouseEvent)
    }

    renderAxis(){
        const svg = d3.select(`#${this.rootId}-g`),
            tickPadding = 5;

        const renderAxisX=()=>{
            const x = d3.axisBottom()
            .scale(this.scale.x)   
            .ticks(this.axis.x.ticks)
            .tickPadding(tickPadding)
            .tickSize(2)

            svg.append("g")
            .attr("class", "axis x")
            .attr("transform", `translate(0,${this.dimension.innerHeight})`)
            .call(x)

            svg.select(".axis.x").selectAll(".tick text")
            .attr("transform", `rotate(-40)`)
            .attr("text-anchor", "end")

            if (this.display.xAxisTitle){
                d3.select(`#${this.rootId}-svg`)
                .append("text")
                .attr("class", "axis-title")
                .attr("x", this.dimension.width/2)
                .attr("text-anchor", "middle")
                .attr("y",  this.dimension.height)
                .attr("dy", "-1em")
                .html(this.axis.x.title)
            }
        }

        const renderAxisY=()=>{
            const y = d3.axisLeft(this.scale.y) 
            .ticks(this.axis.y.ticks)
            .tickPadding(tickPadding)
            .tickSize(2)

            svg.append("g")
            .attr("class", "axis y")
            .attr("transform", `translate(0,0)`)
            .call(y)
        
            if (this.display.yAxisTitle){
                d3.select(`#${this.rootId}-svg`)
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", `translate(${0},${ this.dimension.height/2})rotate(-90)`)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .html(this.axis.y.title)
            }
        }
        renderAxisX()
        renderAxisY()
    }
    renderTitle(){ // rendering DIV not SVG
        // const svg = d3.select(`#${this.rootId}-g`)
        // svg
        //     .append("text")
        //     .attr("class", "plot-title")
        //     .attr("transform", `translate(${this.dimension.innerWidth/2}, 0)`)
        //     .attr("dy", -14)
        //     .attr("text-anchor", "middle")
        //     .html(this.title)
        const plot = d3.select(`#${this.rootId}`)
        plot
            .append("div")
            .style("width", `${this.dimension.width}px`)
            .attr("class", "plot-title")
            .style("position", "absolute")
            .style("top", 0)
            .style("left", 0)
            .style("text-align", "center")
            .html(this.title)
    }

    showTooltip(point, mouse){
        const self = this;
        const tooltip = d3.select(`#${self.rootId}-tooltip`);


        let string; 
        if (self.tooltipConfig == null){  
            string = `<b>${self.axis.y.title}:</b> ${point.y}<br><b>${self.axis.x.title}:</b> ${point.x}<br><b>${self.axis.c.title}:</b> ${point.c}`
        } else {
            string = '';
            self.tooltipConfig.forEach((d,i)=>{
                string += `<b>${d.label}:</b> ${point[d.field]}<br>`
            })
        }

        tooltip
        .html(string)
        .style(`top`, `${mouse[1]-(12*6)}px`) 
        .style(`left`, `${mouse[0] }px`)
      tooltip.transition().duration(100).style("opacity", 1)

    }
    hideTooltip(){
        const self = this;
        const tooltip = d3.select(`#${self.rootId}-tooltip`);
        tooltip.transition().duration(100).style("opacity", 0)
    }
    renderLegend(){
        const self = this;
        const domain = self.scale.c.domain();
        const radius = 6;
        const diameter = radius*3;

        this.legend.dimension = {
            width: d3.select(`#${this.legend.rootId}`).node().clientWidth,
            height: (diameter*(domain.length)) + this.legend.padding.top + this.legend.padding.bottom,
            innerWidth: d3.select(`#${this.legend.rootId}`).node().clientWidth - this.legend.padding.left - this.legend.padding.right,
            innerHeight: diameter*(domain.length)
        }

       

        const svg = d3.select(`#${this.legend.rootId}`)
        .attr('width', self.legend.dimension.width)
        .attr('height', self.legend.dimension.height)
            .append("g")
            .attr('transform', `translate(${self.legend.padding.left}, ${self.legend.padding.top})`);
        

        let max = d3.max(self.scale.c.domain())
        max = max+1;
        let steps = [...Array(max).keys()]
        const scale = d3.scaleBand().domain(steps).range([0, this.legend.dimension.innerWidth]).padding(0)
            const ticks = svg.selectAll(".legend.tick")
            .data(steps)
            .enter()
            .append("g")
            .attr("class", "legend tick")
            .attr("id", (d,i)=> `legend-tick-${i}`)
            .attr('transform', (d,i)=>`translate(${scale(d)},0)`)
            .each(function(d){
                d3.select(this).append("rect")
                .attr("x", 0)
                .attr("y", self.legend.dimension.innerHeight/2)
                .attr("width", scale.bandwidth())
                .attr("height", self.legend.dimension.innerHeight/2)
                .attr("fill", self.scale.c(d))
            })


 
                const x = d3.axisBottom()
                .scale(scale)   
                .tickValues(self.scale.c.domain())
                .tickPadding(5)
                .tickSize(5)
    
                svg.append("g")
                .attr("class", "axis x")
                .attr("transform", `translate(0,${this.legend.dimension.innerHeight})`)
                .call(x)
    
                svg.select(".axis.x").selectAll(".tick text")
                .attr("transform", `translate(-6,0)rotate(-40)`)
                .attr("text-anchor", "end")
                
    }
    
}
