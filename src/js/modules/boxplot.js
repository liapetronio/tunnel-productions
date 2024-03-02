import * as d3 from "d3";

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};


export default class boxplot {
    constructor(
        data,
        title,
        axis,
        rootId,
        dimension = {
            width: d3.select(`#${rootId}`).node().clientWidth,
            height: d3.select(`#${rootId}`).node().clientHeight
        },
        padding = {top: 50, right: 50, bottom: 50, left: 50}
    ) {
        this.data = data;
        this.title = title;
        this.axis = axis;
        this.rootId = rootId;
        this.dimension = dimension;
        this.padding = padding;
        this.updateDimensions();
        this.createScale();
        this.render()

    }
    updateDimensions() {
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScale() {
        this.scale = {
            x: d3.scaleBand().domain(this.axis.x.domain).range([0, this.dimension.innerWidth]).padding(0.5),
            y: d3.scaleLinear().domain([this.axis.y.min, this.axis.y.max]).range([this.dimension.innerHeight, 0])
        }
    }
    render() {
        let scale = this.scale;
        let svg = d3.select(`#${this.rootId}`)
            .append("g")
            .attr("class", "boxplot-plot")
            .attr("id", `${this.rootId}-g`)
            .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`)

        let boxplot = svg.selectAll(".boxplot")
            .data(this.data)
            .enter()

        boxplot.exit().remove()
        boxplot
            .append("g")
            .attr("class", "boxplot")
            .merge(boxplot)
            .attr("transform", d => `translate(${scale.x(d.title)}, 0)`)
            .each(function (d) {
                const arr = d.data.map(function (g) {
                    return g.y;
                })
                const arr_sorted = arr.sort(d3.ascending)
                const min = d3.min(arr);
                const max = d3.max(arr);
                const q1 = d3.quantile(arr_sorted, .25);
                const q3 = d3.quantile(arr_sorted, .75);
                const iqr = q3 - q1; // interquartile range
                const r0 = Math.max(min, q1 - (iqr * 1.5));
                const r1 = Math.min(max, q3 + (iqr * 1.5));

                let stats = {
                    q1: q1,
                    median: d3.quantile(arr_sorted, .5),
                    q3: q3,
                    min: r0,
                    max: r1
                }
                // rectangle for the main box
                const bandWidth = scale.x.bandwidth();

                d3.select(this).append("line")
                    .attr("class", "boxplot-box")
                    .attr("x1", bandWidth / 2)
                    .attr("x2", bandWidth / 2)
                    .attr("y1", scale.y(stats.min))
                    .attr("y2", scale.y(stats.max))
                    .attr("stroke", d.data[0].color.box)

                d3.select(this)
                    .append("rect")
                    .attr("class", "boxplot-box")
                    .attr("x", 0)
                    .attr("y", scale.y(stats.q3))
                    .attr("height", scale.y(stats.q1) - scale.y(stats.q3))
                    .attr("width", bandWidth)
                    .style("stroke", d.data[0].color.box)
                    .style("fill", d.data[0].color.box)
                    .style("fill-opacity", .25)

                // Show the median
                d3.select(this)
                    .append("line")
                    .attr("class", "boxplot-box")
                    .attr("x1", 0)
                    .attr("x2", bandWidth)
                    .attr("y1", scale.y(stats.median))
                    .attr("y2", scale.y(stats.median))
                    .style("stroke", d.data[0].color.box)

                d.data.forEach(e => e.jitter = Math.random() * bandWidth)

                d3.select(this).selectAll(".boxplot-pt").data(d.data)
                     .enter()
                    .append("g")
                    .attr("class", "boxplot-pt")
                    .attr("transform", e=> `translate(${ e.jitter}, ${ scale.y(e.y)})`)
                    .each(function(e){
                        d3.select(this).append("circle")
                        .attr("r", e.r)
                        .attr("fill", e.color.pt)
                        .attr("stroke", e.color.pt)
                        .attr("fill-opacity", .5)
                    })
          
                // d3.select(this).selectAll("circle")
                //     .data(d.data)
                //     .enter()
                //     .append("circle")
                //     .attr("cx", e => e.jitter)
                //     .attr("cy", e => scale.y(e.y))
                //     .attr("r", e => e.r)
                //     .attr("fill", e=> e.color.pt)
                //     .attr("stroke", e=> e.color.pt)
                //     .attr("stroke-width", 0.5)
                //     .attr("fill-opacity", 0.75)
        })
         this._axis()
         this._title()
    }

    _axis() {

        const svg = d3.select(`#${this.rootId}-g`),
        tickPadding = 8;

        const renderAxisX=()=>{
            const x = d3.axisBottom()
                .scale(this.scale.x)   
                .ticks(5)
                .tickPadding(tickPadding)
             //   .tickSize(-this.dimension.innerHeight)
                .tickSize(0)
                .tickSizeInner(-this.dimension.innerHeight);
            
                svg.append("g")
                .attr("class", "axis axis x")
                .attr("transform", `translate(0,${this.dimension.innerHeight})`)
                .call(x)
                .selectAll("text")
                .attr("text-anchor", "end")
                .attr("transform", "translate(-5, 0)rotate(-30)")

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
    //    svg.selectAll(".domain").remove()

        
    }
    _title(){
        const svg = d3.select(`#${this.rootId}-g`)
        svg
            .append("text")
            .attr("class", "title")
            .attr("transform", `translate(${this.dimension.innerWidth/2}, 0)`)
            .attr("dy", -25)
            .attr("text-anchor", "middle")
            .html(this.title)
    }
}

