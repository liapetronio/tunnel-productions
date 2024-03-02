import * as d3 from "d3";

export function createLatticeData(data, rowField = "rowField", columnField = "columnField") {
    const self = this;
    let groups = d3.groups(data, d => d[rowField], d => d[columnField]);
    //Sort the groups here
    groups.forEach(d => {
      d[1].sort((a, b) => d3.ascending(parseFloat(a[0]), parseFloat(b[0])))
    })
    groups = groups.sort(function (a, b) {
      return d3.ascending(parseFloat(a[0]), parseFloat(b[0]))
    })
    let lattice = groups.map((d, rowIndex) => {
      return d[1].map((e, colIndex) => { 
          return {
            column: colIndex,
            columnName: e[0],
            row: rowIndex,
            rowName: d[0],
            data: e[1]
          }
        })
    }).flat();
    // updateLatticeData(lattice, rootName, padding);
    return lattice;
}
export function updateLatticeLayout(data, rootName="lattice", padding = { top: 10, right: 10, bottom: 10, left: 10 }, grid = {rows: null, columns: null}) {
  const self = this;
  let dimension =  {}, 
  scale = {},
  columns = grid.columns,
  rows = grid.rows;

  dimension.width = d3.select(`#${rootName}`).node().clientWidth;
  dimension.innerWidth =  dimension.width - padding.left - padding.right;

  if (!columns) {
    columns = d3.max(data.map(d=>d.column)) + 1; // add 1 to account for 0 indexing
  } 

  if (!grid.rows) {
    rows = d3.max(data.map(d=>d.row)) + 1; // add 1 to account for 0 indexing
  }
  let xDomain = [...Array(columns).keys()];
  let yDomain = [...Array(rows).keys()];
  scale.x = d3.scaleBand().domain(xDomain).range([padding.left, dimension.innerWidth]);
  dimension.innerHeight = (scale.x.bandwidth() * rows) + padding.top + padding.bottom;
  dimension.height = dimension.innerHeight + padding.top + padding.bottom;

  d3.select(`#${rootName}`).style("height", `${dimension.height}px`);
  scale.y = d3.scaleBand().domain(yDomain).range([padding.top, dimension.innerHeight])

  data.forEach(d=>{
      d.id = `${rootName}-x-${d.column}-${d.row}-y`
      d.x = scale.x(d.column);
      d.y = scale.y(d.row);
      d.width = scale.x.bandwidth();
      d.height = scale.y.bandwidth();
  })
}
export function updateLatticeCommonXYLayout(data, rootName="lattice", padding = { top: 10, right: 10, bottom: 10, left: 10 }, grid = {rows: null, columns: null}) {
    const self = this;
    let dimension =  {}, 
    scale = {},
    columns = grid.columns,
    rows = grid.rows;

    dimension.width = d3.select(`#${rootName}`).node().clientWidth;
    dimension.innerWidth =  dimension.width - padding.left - padding.right;

    if (!columns) { columns = d3.max(data.map(d=>d.column)) + 1; } // add 1 to account for 0 indexing  
    if (!grid.rows) { rows = d3.max(data.map(d=>d.row)) + 1; } // add 1 to account for 0 indexing

    let addPadding = 35;
    let xSize = (dimension.innerWidth - addPadding) / columns;

    data.forEach(d=>{
      d.id = `${rootName}-x-${d.column}-${d.row}-y`
      let width, height, paddingLeft, paddingBottom;

      if (d.column == 0){
          paddingLeft = padding.left + addPadding;
          width = xSize + addPadding;
      } else {
          paddingLeft = padding.left;
          width = xSize;
      }

      if (d.row == (rows - 1)) {
        paddingBottom = addPadding + padding.bottom;
        height = xSize + addPadding;    
      } else {
        height = xSize;
        paddingBottom = padding.bottom;
      }
      d.padding = {
        left: paddingLeft,
        bottom: paddingBottom,
        top: padding.top,
        right: padding.right
      }
      d.width = width;
      d.height = height;
  })
}
export function updateLatticeCommonYLayout(data, rootName="lattice", padding = { top: 10, right: 10, bottom: 10, left: 10 }, grid = {rows: null, columns: null}) {
  const self = this;
  let dimension =  {}, 
  scale = {},
  columns = grid.columns,
  rows = grid.rows;

  dimension.width = d3.select(`#${rootName}`).node().clientWidth;
  dimension.innerWidth =  dimension.width - padding.left - padding.right;

  if (!columns) { columns = d3.max(data.map(d=>d.column)) + 1; } // add 1 to account for 0 indexing  
  if (!grid.rows) { rows = d3.max(data.map(d=>d.row)) + 1; } // add 1 to account for 0 indexing

  let addPadding = 25;
  let xSize = (dimension.innerWidth - addPadding) / columns;

  data.forEach(d=>{
    d.id = `${rootName}-x-${d.column}-${d.row}-y`
    let width, height, paddingLeft, paddingBottom;

    if (d.column == 0){
        paddingLeft = padding.left + addPadding;
        width = xSize + addPadding;
    } else {
        paddingLeft = padding.left;
        width = xSize;
    }
    paddingBottom = addPadding + padding.bottom;
    height = xSize + addPadding;    
    d.padding = {
      left: paddingLeft,
      bottom: paddingBottom,
      top: padding.top,
      right: padding.right
    }
    d.width = width;
    d.height = height;
})
}

// functions below should be class extensions/methods?? they rely on the class properties
export function plotTitle(self){
  const plot = d3.select(`#${self.rootId}`)
  plot
      .append("div")
      .style("width", `${self.dimension.width}px`)
      .attr("class", "plot-title")
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("text-align", "center")
      .html(self.title)
}

export function thresholds(self){
  const svg = d3.select(`#${self.rootId}-svg`);
  if (self.axis.x.threshold){
      svg.selectAll(".axis.x .tick line").filter(d=>d== +self.axis.x.threshold ).remove(); 
      svg.select(".axis.x").append("line")
      .attr("class", "tick threshold-line")
      .attr("x1", self.scale.x(self.axis.x.threshold))
      .attr("x2", self.scale.x(self.axis.x.threshold))
      .attr("y1", 0)
      .attr("y2", -self.dimension.innerHeight)
      .attr("stroke-dasharray", "4,4")
      .attr("stroke", "black")
      .attr("stroke-width", "0.75px")
  } 
  if (self.axis.y.threshold){

    svg.selectAll(".axis.y .tick line").filter(d=>d==self.axis.y.threshold).remove()
    svg.select(".axis.y").append("line")
    .attr("class", "tick threshold-line")
    .attr("y1", self.scale.y(self.axis.y.threshold))
    .attr("y2", self.scale.y(self.axis.y.threshold))
    .attr("x1", 0)
    .attr("x2", self.dimension.innerWidth)
    .attr("stroke-dasharray", "4,4")
    .attr("stroke", "black")
    .attr("stroke-width", "0.75px")
}
}

export function axis(self){
  const svg = d3.select(`#${self.rootId}-g`),
  tickPadding = 2.5;

  const y = d3.axisLeft(self.scale.y) 
  .ticks(self.axis.y.ticks)
  .tickPadding(tickPadding)

  svg.append("g")
  .attr("class", "axis y")
  .attr("transform", `translate(0,0)`)
  .call(y)

  const x = d3.axisBottom()
  .scale(self.scale.x)   
  .ticks(self.axis.x.ticks)
  .tickPadding(tickPadding)

  svg.append("g")
  .attr("class", "axis x")
  .attr("transform", `translate(0,${self.dimension.innerHeight})`)
  .call(x)

  svg.selectAll(".axis.y .tick line").attr("x1", self.dimension.innerWidth);
  svg.selectAll(".domain").remove();


  if (!self.display.xAxisTicks){
    svg.selectAll(".axis.x .tick text").remove()
    }
  if (self.display.xAxisTitle){
      d3.select(`#${self.rootId}-svg`)
      .append("text")
      .attr("class", "axis-title")
      .attr("x", self.dimension.width/2)
      .attr("text-anchor", "middle")
      .attr("y",  self.dimension.height)
      .attr("dy", "-1.0em")
      .html(self.axis.x.title)
  }
  if (!self.display.yAxisTicks){
      svg.selectAll(".axis.y .tick text").remove()
  }
  if (self.display.yAxisTitle){
      d3.select(`#${self.rootId}-svg`)
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", `translate(${0},${ self.dimension.height/2})rotate(-90)`)
      .attr("dy", "1.0em")
      .attr("text-anchor", "middle")
      .html(self.axis.y.title)
  }
}