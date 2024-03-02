import * as d3 from "d3";
import * as plotUtils from '@/js/utils/plot-utils.js';
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


export default class scatter extends defaultPlotConfig{
    // export default class scatter {
    constructor(
        rootId, 
        data,
        config,
        states
    ) { 
        super(rootId, config);
        let defaults = new defaultPlotConfig(rootId, config);
        Object.assign(defaults.getDefaults(), this );
        this.data = data.sort((a,b)=> d3.ascending(a.c, b.c));
        this.states = states;
        if (!this.scale.hasOwnProperty("x")){ this.scale.x = this.setScaleX() } 
        if (!this.scale.hasOwnProperty("y")){ this.scale.y = this.setScaleY() }
        if (!this.scale.hasOwnProperty("c")){ this.scale.c = this.setScaleC() }
        this.render();

        if (this.display.legend){ // requires createScale() for setting scale.c.... make this a separate class method? 
            this.legend = config.legend;
            this.renderLegend();
        }
    }
    setScaleX(){
        let domain;
        if (!this.axis.x.hasOwnProperty("domain")){ domain = d3.extent(this.data.map(d=>d.x)) } else { domain = this.axis.x.domain }
        return d3.scaleLinear().domain(domain).range([this.axis.innerPadding, this.dimension.innerWidth-this.axis.innerPadding]).nice() 
    }
    setScaleY(){
        let domain;
        if (!this.axis.x.hasOwnProperty("domain")){ domain = d3.extent(this.data.map(d=>d.y)) } else { domain = this.axis.y.domain }
        return d3.scaleLinear().domain(domain).range([this.dimension.innerHeight-this.axis.innerPadding, this.axis.innerPadding]).nice() 
    }
    setScaleC(){
        if (!this.axis.c.hasOwnProperty("type")){ this.axis.c.type = "linear" } 
        if (!this.axis.c.hasOwnProperty("domain")){ 
            if (this.axis.c.type == "ordinal"){ this.axis.c.domain = [...new Set(this.data.map(d=>d.c))] } 
            if (this.axis.c.type == "custom"){ this.axis.c.domain = [...new Set(this.data.map(d=>d.c))] } 
            else { this.axis.c.domain = d3.extent(this.data.map(d=>d.c)) } 
        } 
        if (!this.axis.c.hasOwnProperty("range")){ 
            if (this.axis.c.type == "custom"){ this.axis.c.range = this.axis.c.domain } // assumes the color value is already in the data
            else if (this.axis.c.type == "ordinal"){ this.axis.c.range = d3.schemeCategory10 } 
            else if (this.axis.c.type == "linear") { this.axis.c.range = [d3.schemeReds[3][0], d3.schemeReds[3][2]] } 
        } 
        if (this.axis.c.type == "custom"){
            return d3.scaleOrdinal().domain(this.axis.c.domain).range(this.axis.c.domain) 
        } else if (this.axis.c.type == "ordinal"){
            return d3.scaleOrdinal().domain(this.axis.c.domain).range(this.axis.c.range) 
        } else if (this.axis.c.type == "linear"){
            return d3.scaleLinear().domain(this.axis.c.domain).range(this.axis.c.range)
        } else if (this.axis.c.type == "sequential"){
            return d3.scaleSequential().domain(this.axis.c.domain).interpolator(d3.interpolateOrRd)
        } else if (this.axis.c.type == "diverging"){
            return d3.scaleSequential().domain(this.axis.c.domain).interpolator(d3.interpolateRdBu) 
        } 
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

        container.append('canvas')
        .attr('width', self.dimension.innerWidth)
        .attr('height', self.dimension.innerHeight)
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-canvas")
        .style("position", "absolute")
        .style("top", "0px")
        .style("left", "0px")
        .attr('id', `${self.rootId}-canvasFocus`);

        container.append('canvas')
        .attr('width', self.dimension.innerWidth)
        .attr('height', self.dimension.innerHeight)
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-canvas")
        .style("position", "absolute")
        .style("top", "0px")
        .style("left", "0px")
        .style("pointer-events", "none")
        .attr('id', `${self.rootId}-canvasSelections`);

        // Init tooltip
        container.append('div')
        .style('margin-left', self.padding.left + 'px')
        .style('margin-top', self.padding.top + 'px')
        .attr("class", "plot-tooltip")
        .attr('id', `${self.rootId}-tooltip`)
        .style("opacity", 0);

        this.renderAxis()
        this.renderFocus(); 
        if (this.display.title){ plotUtils.plotTitle(this) }
    }
    renderContext(){
        const self = this;
        const canvas = d3.select(`#${self.rootId}-canvasContext`)
        const ctx = canvas.node().getContext('2d');
        let data = this.data;

        data.forEach(point => {
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 0.15;
            ctx.fillStyle = "#e2e2e2";
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  point.r;
            ctx.arc(px, py, pr, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
        });
    }

    renderFocus(){ // aka: render highlights 
        const self = this;
        const canvas = d3.select(`#${self.rootId}-canvasFocus`)
        const ctx = canvas.node().getContext('2d');
        let data = this.data;

        data.forEach(point => {
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 0.15;
            ctx.fillStyle = self.scale.c(point.c);
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  point.r;
            ctx.arc(px, py, pr, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
        });
    }
    renderSelections(){ // should input data objs from states.click + states.mouseover rather than filtering all data? or use crosfilter.js?
        const self = this;
        const canvas = d3.select(`#${self.rootId}-canvasSelections`)
        const ctx = canvas.node().getContext('2d');
        ctx.clearRect(0, 0, self.dimension.innerWidth, self.dimension.innerHeight);
        let data = this.data.filter(d=> self.states.click.includes(d.id) || self.states.mouseover == d.id)

        data.forEach(point => {
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.fillStyle = self.scale.c(point.c);
            const px = self.scale.x(point.x);
            const py =  self.scale.y(point.y);
            const pr =  point.r;
            ctx.arc(px, py, pr, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
        });

    }
    renderAxis(){
        plotUtils.axis(this)
        plotUtils.thresholds(this)   
    }

    showTooltip(point, mouse){
        const self = this;
        const tooltip = d3.select(`#${self.rootId}-tooltip`);
        let string; 
            string = '';
            self.tooltipConfig.forEach((d,i)=>{
                string += `<b>${d.label}:</b> ${point[d.field]}<br>`
            })

        tooltip
        .html(string)
        .style(`top`, `${mouse[1]-(12*6)}px`) 
        .style(`left`, `${mouse[0]+14 }px`)

        tooltip.transition().duration(50).style("opacity", 1)
    }
    hideTooltip(){
        const self = this;
        const tooltip = d3.select(`#${self.rootId}-tooltip`);
        tooltip.transition().duration(50).style("opacity", 0)
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

        const scale = d3.scaleBand().domain(domain).range([0, this.legend.dimension.innerHeight]).padding(.5)

        const svg = d3.select(`#${this.legend.rootId}`)
        .attr('width', self.legend.dimension.width)
        .attr('height', self.legend.dimension.height)
            .append("g")
            .attr('transform', `translate(${self.legend.padding.left}, ${self.legend.padding.top})`);
      
            const ticks = svg.selectAll(".legend.tick")
            .data(domain)
            .enter()
            .append("g")
            .attr("class", "legend tick")
            .attr("id", (d,i)=> `legend-tick-${i}`)
            .attr('transform', d=>`translate(0, ${scale(d)})`)
            .each(function(d){
                d3.select(this).append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", radius)
                .attr("fill", self.scale.c(d))

                d3.select(this).append("text")
                .text(d)
                .attr("y", radius/ 2)
                .attr("x", radius *2)
                .attr("text-anchor", "start")
                .style("font-size", "14px")

            })
            
    }

}