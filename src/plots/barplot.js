import * as d3 from "d3";
import defaultPlotConfig from './default-plot-config.js';
import * as plotUtils from '@/js/utils/plot-utils.js';

export default class barplot extends defaultPlotConfig{
    constructor(
        rootId, 
        data,
        config,
        states
    ) {
        super(rootId, config);
        let defaults = new defaultPlotConfig(rootId, config);
        Object.assign(defaults.getDefaults(), this );
        this.data = data.sort((a,b)=> d3.ascending(a.y, b.y));
        this.states = states;

        if (!this.scale.hasOwnProperty("x")){ this.scale.x = this.setScaleX() } 
        if (!this.scale.hasOwnProperty("y")){ this.scale.y = this.setScaleY() }
        if (!this.scale.hasOwnProperty("c")){ this.scale.c = this.setScaleC() }

        this.render();

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
        if (!this.axis.c.hasOwnProperty("type")){ this.axis.c.type = "custom" } 
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
        container.append('svg')
        .attr('width', self.dimension.width)
        .attr('height', self.dimension.height)
        .attr('id', `${self.rootId}-svg`)
        .append('g')
        .attr("id", `${self.rootId}-g`)
        .attr("class", "plot-g")
        .attr('transform', `translate(${self.padding.left}, ${self.padding.top})`);

        this.renderAxis()
        if (this.display.title){ plotUtils.plotTitle(this) }
        this.update()
    }

    renderAxis(){
        plotUtils.axis(this)
        plotUtils.thresholds(this)
    }

    update(){
        const self = this;
        let plot =  d3.select(`#${self.rootId}-g`)
        let bar = plot.selectAll("rect")
        .data(self.data)

        bar.exit().remove()
        bar
         .enter()
         .append("rect")
         .merge(bar)
        .attr("transform", function(d) { return "translate(" + self.scale.x(d.x0) + "," + self.scale.y(d.y0) + ")"; })
        .attr("height", function(d) { return self.scale.y(d.y0) - self.scale.y(d.y1) -1 ; })
        .attr("width", function(d) { return self.scale.x(d.x1); })
        .style("fill", d=> self.scale.c(d.c) )
   }
}