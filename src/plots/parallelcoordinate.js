import * as d3 from "d3";
import * as helpers from '@/js/utils/helpers.js';
import { render } from "../js/modules/table";
// import $ from "jquery";




export default class parallelcoordinate {
    constructor(
        rootId, 
        data,
        config,
        states
    ) { 
        this.rootId = rootId;
        this.data = data

        this.states = states;
        this.title = config.title;
        this.axis = config.axis;
        this.tooltipConfig = config.tooltipConfig;
        if (!this.axis.x){ this.axis.x = { } }
        if (!this.axis.y){ this.axis.y = { } }
        if (!this.axis.x.ticks){ this.axis.x.ticks = 5 }
        if (!this.axis.y.ticks){ this.axis.y.ticks = 5 }
        this.scale = config.scale;
        if (!this.scale){ this.scale = { } }
        this.dimension = config.dimension; 
        if (!this.dimension){
            this.dimension = {
                width: d3.select(`#${this.rootId}`).node().clientWidth,
                height:  d3.select(`#${this.rootId}`).node().clientHeight
            }
        }
        this.padding = config.padding;    
        if (!this.padding){ this.padding = { top:20, right:20, bottom:20, left:20 } }
        this.display = config.display
        if (!this.display){ this.display = { title: true, legend: false, xAxisTitle: true, yAxisTitle: true } }
    
        this.updateDimensions(); 
        this.createScale();
        this.renderCanvas();
        this.renderPlot();

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
        const rSize = 10;

        const getxExtent = ()=>{
            // if (!this.axis.x.domain){ return d3.extent(this.data.map(d=>d.x))}
            if (!this.axis.x.domain){ return d3.extent(this.data.map(d=>d[0]))}
            else { return this.axis.x.domain }
        }
        const getyExtent = ()=>{
            // if (!this.axis.y.domain){ return d3.extent(this.data.map(d=>d.y))}
            if (!this.axis.y.domain){ return d3.extent(this.data.map(d=>d[1]))}
            else { return this.axis.y.domain }
        }
        const getcDomain = ()=>{
            if (!this.axis.c.domain){ return [...new Set(this.data.map(d=>d.c))]}
            else { return this.axis.c.domain }
        }
        const getcExtent= ()=>{
            if (!this.axis.c.domain){ 
                return d3.extent(this.data.map(d=>d.c))
            }
            else { return this.axis.c.domain }
        }
        const getColorScale = ()=>{
            if (this.axis.c.type == "sequential"){
                return d3.scaleSequential().domain(getcExtent()).interpolator(d3.interpolateYlOrRd)
            } else if (this.axis.c.type == "linear"){
                return d3.scaleLinear().domain(getcExtent()).range(this.axis.c.range)
            } else if (this.axis.c.type == "ordinal"){
                return d3.scaleOrdinal().domain(getcDomain()).range(this.axis.c.range) 
            }
        }
        const getRRange = ()=>{
            return [Math.sqrt(rSize), Math.sqrt(rSize)]
            // if (self.innerWidth > 200){ return [5,5]} 
            // else { return [3,3]}
        }

        const getCustomXScale = ()=>{
            if (this.display.customXAxis.type == "ordinal"){
                return d3.scaleOrdinal()
            } else if (this.display.customXAxis.type == "linear"){  
                return d3.scaleLinear()
            } else if (this.display.customXAxis.type == "log"){  
                return d3.scaleLog()
            }
        }

         if (!this.scale.r){ this.scale.r = d3.scaleSqrt().domain(d3.extent(self.data.map(d=>d.r))).range(getRRange()) }
        if (!this.scale.x){ this.scale.x = d3.scaleLinear().domain(getxExtent()).range([0, this.dimension.innerWidth-rSize]);}
        if (this.display.customXAxis){
            this.scale.xCustom = getCustomXScale().domain(this.display.customXAxis.domain).range([0, this.dimension.innerWidth-rSize])
        }
        if (!this.scale.y){ this.scale.y = d3.scaleLinear().domain(getyExtent()).range([this.dimension.innerHeight, 0]);}
        if (!this.scale.c){ this.scale.c = getColorScale(); }
    }

    renderCanvas(){
        const self = this;
        const container = d3.select(`#${self.rootId}`)
        // Init Svg
        container.append('svg')
        .attr('width', self.dimension.width)
        .attr('height', self.dimension.height)
        .attr('id', `${self.rootId}-svg`)
        .attr("class", "plot-svg")
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
        .attr('id', `${self.rootId}-canvas`);

        container.append('canvas')
        .attr('width', self.dimension.innerWidth)
        .attr('height', self.dimension.innerHeight)
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-canvas")
        .attr('id', `${self.rootId}-focus`)
        // Init tooltip
        container.append('div')
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-tooltip")
        .attr('id', `${self.rootId}-tooltip`);

        this.hideTooltip()
    }
    renderPlot(){

            this.renderAxis()
            this.renderPaths()
        if (this.display.title){  this.renderTitle() }
    }
    renderPaths(){
        const self = this;
        // for all dose curves
        const context = d3.select(`#${self.rootId}-canvas`).node().getContext('2d');
        // for selected (mouseover and click) dose curves
        const focus = d3.select(`#${self.rootId}-focus`).node().getContext('2d');

        // clear previously rendered canvas 
        context.clearRect(0, 0, self.dimension.innerWidth, self.dimension.innerHeight);
        focus.clearRect(0, 0, self.dimension.innerWidth, self.dimension.innerHeight);
        let grey = "#e2e2e2";

      let plotData = self.data.map(d=>d)
        plotData.forEach(d => {
            let showPoint;
            if (self.states.highlight.series != null) {
                d.paths = d.path.filter(e => e.color == self.states.highlight.color && e.series == self.states.highlight.series)
                if (d.point) {
                    if (d.point.c == self.states.highlight.color && d.point.series == self.states.highlight.series) {
                        showPoint = true;
                    } else {
                        showPoint = false;
                    }
                } else {
                    showPoint = false;
                }

            } else {
                d.paths = d.path
                if (d.point) {
                    showPoint = true;
                }
            }
            d.showPoint = showPoint;
        })

        let alpha;

        if (plotData.length > 5000) {
            alpha = 0.05
        } else if (plotData.length > 1000) {
            alpha = 0.25
        } else {
            alpha = 0.5
        }

        let unselected = plotData.filter(d => !self.states.click.includes(d.id) && self.states.mouseover != d.id)
        unselected.forEach(d => {
            let color, isSelected;
            if (unselected.length == plotData.length) {
                isSelected = true;
                color = null
            } else {
                isSelected = false
                color = grey
            }
            d.paths.forEach(path => {
                //if path has color attribute override data color attribute
                if (isSelected) {
                    color = path.color ? self.scale.c(path.color) : self.scale.c(d.c)
                }
                self.path(context, path, color, alpha, 2, false)
            })
            if (d.showPoint) {
                if (isSelected) {
                    color = d.point.color ? self.scale.c(d.point.color) : self.scale.c(d.c)
                }
                self.point(context, d.point, color, 0.25)
            }
        })

        let selection = plotData.filter(d => self.states.click.includes(d.id) || self.states.mouseover == d.id)
        selection.forEach(d => {
            d.paths.forEach(path => {
                let color = path.color ? self.scale.c(path.color) : self.scale.c(d.c)
                self.path(focus, path, color, 0.9, 4, true)
            })
            if (d.showPoint) {
                self.point(focus, d.point, self.scale.c(d.c), 1)
            }
        })
    }
    path(ctx, data, color, alpha, lineWidth) {
            const self = this;
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            let lineDash;
            let adjustedLineWidth;
            if (data.pathType=="dashed"){ 
                lineDash = [10,2] 
                adjustedLineWidth = lineWidth/2
            }
            else
             { 
                lineDash = [0,0]
                adjustedLineWidth = lineWidth;
            
            }
            ctx.lineWidth = adjustedLineWidth;
            ctx.setLineDash(lineDash);
            ctx.beginPath();
            data.points.forEach((point, index)=>{    
                if (index == 0) {
                ctx.moveTo(self.scale.x(point[0]),self.scale.y(point[1]));
                } else { 
                ctx.lineTo(self.scale.x(point[0]),self.scale.y(point[1]));
                }
            })
            ctx.stroke();
    }
    point(ctx, point, color, alpha) {
        const self = this;      
            ctx.setLineDash([0,0]);
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 0.5;
            const px = self.dimension.innerWidth - (self.scale.r(point.r)) ;
            const py =  self.scale.y(point.y);
            ctx.arc(px, py, self.scale.r(point.r), 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
}

    renderAxis(){
        const svg = d3.select(`#${this.rootId}-g`),
        tickPadding = 5;
        const renderAxisX=()=>{

            if (this.display.customXAxis){
                const xCustom = d3.axisBottom()
                .scale(this.scale.xCustom)   
                .tickPadding(tickPadding)
                .tickSize(0)
                .tickSizeInner(-this.dimension.innerHeight);

                if ((this.display.customXAxis.tickValues)){  xCustom.tickValues(this.display.customXAxis.tickValues)  }
                if ((this.display.customXAxis.ticks)){  xCustom.ticks(this.display.customXAxis.ticks)  }
    
                let xaxis = svg.append("g")
                .attr("class", "axis x")
                .attr("transform", `translate(0,${this.dimension.innerHeight})`)
                .call(xCustom)

                xaxis.selectAll(".tick text").html(d=> d)

            } else {
                const x = d3.axisBottom()
                .scale(this.scale.x)   
                .tickPadding(tickPadding)
                .tickSize(0)
                .tickSizeInner(-this.dimension.innerHeight);
    
                if ((this.axis.x.tickValues)){ x.tickValues(this.axis.x.tickValues)  }
                if ((this.axis.x.ticks)){  x.ticks(this.axis.x.ticks)  }
    
                svg.append("g")
                .attr("class", "axis x")
                .attr("transform", `translate(0,${this.dimension.innerHeight})`)
                .call(x)
    
            }


     
    
        if (this.display.xAxisTitle){
            d3.select(`#${this.rootId}-svg`)
            .append("text")
            .attr("class", "axis-title")
            .attr("x", this.dimension.width/2)
            .attr("text-anchor", "middle")
            .attr("y",  this.dimension.height)
            .attr("dy", "-1.25em")
            .html(this.axis.x.title)
        }
    }

        const renderAxisY=()=>{
            const y = d3.axisLeft(this.scale.y) 
            .ticks(this.axis.y.ticks)
            .tickPadding(tickPadding)
            .tickSize(0)
            .tickSizeInner(-this.dimension.innerWidth)

            svg.append("g")
            .attr("class", "axis y")
            .attr("transform", `translate(0,0)`)
            .call(y)

            if (this.display.yAxisTitle){
                d3.select(`#${this.rootId}-svg`)
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", `translate(${0},${ this.dimension.height/2})rotate(-90)`)
                  .attr("dy", "2em")
                .attr("text-anchor", "middle")
                .html(this.axis.y.title)
            }

        }
        renderAxisX()
        renderAxisY()        
    }
    renderTitle(){
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
    
    // Create a tooltipConfig that contains array of obj with {label:"" attribute:""} that will be displayed in tooltip
    showTooltip(point, mouse){
        const self = this;
        const tooltip = d3.select(`#${self.rootId}-tooltip`);

        let string; 
        if (self.tooltipConfig == null){  
            string = `${point.label}<br><b>${self.axis.x.title}:</b> ${point.x}<br><b>${self.axis.y.title}:</b> ${point.y}`
        } else {
            string = '';
            self.tooltipConfig.forEach((d,i)=>{
               if (point[d.field] != null){
                string += `<b>${d.label}:</b> ${point[d.field]}<br>`
               }
                
            })
        }

        
        tooltip
        .html(string)
   //     .html(`Cell line: ${point.label}<br>Added Compounds: ${point.added_compounds}<br>Added Doses: ${point.added_doses}<br>Viability at added dose: ${point.blissFactor}`)
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
   
        const radius = 6;
        const diameter = radius*3;
        let legendPaths = [];

        this.data.forEach(d=>{
            d.path.forEach(path=>{
                //if path has color attribute override data color attribute
                const color  = path.color ? path.color : d.c;
                // const color = d.c;
                legendPaths.push({ 
                        label: path.label, 
                        color: color,
                        shape: "line", 
                        pathType: path.pathType, 
                        series: path.series 
                    })
            })
            if (d.point){
                legendPaths.push({  
                    label: d.point.label, 
                    color: d.c, 
                    shape: "circle", 
                    series: d.point.series 
                })
            }
        })

        var map = new Map();
        for (let each of legendPaths) {
            map.set(each["label"], each);
        }
        var iteratorValues = map.values();
        var unique = [...iteratorValues];
        unique.sort((a,b)=>b.label.localeCompare(a.label))

        let domain = unique.map(d=>d.label)

        this.legend.dimension = {
            width: d3.select(`#${this.legend.rootId}`).node().clientWidth,
            height: (diameter*(domain.length)) + this.legend.padding.top + this.legend.padding.bottom,
            innerWidth: d3.select(`#${this.legend.rootId}`).node().clientWidth - this.legend.padding.left - this.legend.padding.right,
            innerHeight: diameter*(domain.length)
        }

        const scale = d3.scaleBand().domain(domain).range([0, this.legend.dimension.innerHeight]).padding(.5)

        const svg = d3.select(`#${this.legend.rootId}`)
        .attr('width', self.legend.dimension.width)
        .attr('height', self.legend.dimension.height)
            .append("g")
            .attr('transform', `translate(${self.legend.padding.left}, ${self.legend.padding.top})`);
      
            const ticks = svg.selectAll(".legend.tick")
            .data(unique)
            .enter()
            .append("g")
            .attr("class", "legend tick")
            .attr("id", (d,i)=> `legend-tick-${i}`)
            .attr('transform', d=>`translate(0, ${scale(d.label)})`)
            .each(function(d){

                 if (d.shape=="line"){
                    d3.select(this).append("line")
                    .attr("class", "tick-pathType")
                    .attr("x1", 0)
                    .attr("x2", radius*4)
                    .attr("y1", 0)
                    .attr("y2", 0)
                    .style("stroke", self.scale.c(d.color))
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", d.pathType=="dashed" ? "2,2" : "0,0")
                }
               else if (d.shape=="circle"){
                d3.select(this).append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 4)
                .style("fill", self.scale.c(d.color))
                }


                d3.select(this).append("text")
                .text(d.label)
                .attr("y", radius/ 2)
                .attr("x", (radius *4)+2)
                .attr("text-anchor", "start")
                .style("font-size", "14px")

            })
            
    }

}