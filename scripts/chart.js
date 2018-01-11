var width = 700;
var height = 600;
var radius = 5;
var side = radius * 2;

var margin = { "top": 50,
               "bottom": 50,
               "left": 100,
               "right": 10 };

// creating svg canvas
var svg = d3.select(".flex-container")
              .append("svg")
              .attr("height", height)
              .attr("width", width)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select(".flex-container")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

var scaleX = d3.scaleLinear().range([0, (width - (margin.left + margin.right))])
var scaleY = d3.scaleLinear().range([0, (height - (margin.bottom + margin.top))])

queue()
    .defer(d3.csv, "./data/mock-data-m.csv") // import data from csv file
    .defer(d3.csv, "./data/mock-data-f.csv") // import data from csv file
    .await(function(err, dataM, dataF) {

      dataM.forEach(function(d) {
        d.competitiveness = +d.competitiveness;
        d.viability = +d.viability;
      });

      dataF.forEach(function(d) {
        d.competitiveness = +d.competitiveness;
        d.viability = +d.viability;
      });

      var dataIn = d3.merge([dataM, dataF]);

      scaleX.domain([0, getMaxX(dataIn)])
      scaleY.domain([getMaxY(dataIn), 0])

      xAxis(scaleX);
      yAxis(scaleY);

      drawCircles(dataF);
      drawRects(dataM);

    });

function getMaxX(dataset) {
      var xMax = d3.max(dataset, function(d) { return d.competitiveness });
      return Math.ceil(xMax / 10) * 10
}

function getMaxY(dataset) {
      var yMax = d3.max(dataset, function(d) { return d.viability });
      return Math.round(yMax / 100) * 100;
}

// defining functions to create labels for axis
function xLabel() {
          svg.append("text")
              .attr("x", (width - 2 * margin.left - 1.5 * margin.right))
              .attr("y", ((height - margin.top - margin.bottom) * 1.08))
              .attr("class", "label")
              .attr("text-anchor", "middle")
              .text("Home Runs");
};

function yLabel() {
          svg.append("text")
               .attr("transform", "rotate(270)")
               .attr("x", -50)
               .attr("y", -40)
               .attr("class", "label")
               .attr("text-anchor", "middle")
               .text("Games Against");
};

function drawCircles(dataset) {

  var scatterPlot = svg.selectAll("circle")
                        .data(dataset);

      scatterPlot.transition()
                    .duration(500)
                    .ease(d3.easeSin)
                 .attr("cx", function(d) { return scaleX(d.competitiveness) })
                 .attr("cy", function(d) { return scaleY(d.viability) })
                 .attr("r", radius)
                 .attr("fill", "black")
                 .attr("opacity", .8);

      scatterPlot.enter()
                  .append("circle")
                  .attr("cx", function(d) { return scaleX(d.competitiveness) })
                  .attr("cy", function(d) { return scaleY(d.viability) })
                  .attr("r", 0)
                  .on("mouseover", mouseOver)
                  .on("mouseout", mouseOut)
                    .transition()
                    .duration(500)
                    .ease(d3.easeSin)
                  .attr("r", radius)
                  .attr("fill", "red")
                  .attr("opacity", .8);

      scatterPlot.exit()
                  .transition()
                  .duration(300)
                  .ease(d3.easeSin)
                .attr("r", 0)
               .remove();

};

function drawRects(dataset) {

  var rectsPlot = svg.selectAll("rect")
                        .data(dataset);

      rectsPlot.transition()
                  .duration(500)
                  .ease(d3.easeSin)
               .attr("x", function(d) { return (scaleX(d.competitiveness) - side/2) })
               .attr("y", function(d) { return (scaleY(d.viability) - side/2) })
               .attr("width", side)
               .attr("height", side)
               .attr("fill", "green")
               .attr("opacity", .8);

      rectsPlot.enter()
                .append("rect")
                .attr("x", function(d) { return (scaleX(d.competitiveness) - side/2) })
                .attr("y", function(d) { return (scaleY(d.viability) - side/2) })
                .attr("width", 0)
                .attr("height", 0)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut)
                  .transition()
                  .duration(500)
                  .ease(d3.easeSin)
                .attr("width", side)
                .attr("height", side)
                .attr("fill", "green")
                .attr("opacity", .8);

      rectsPlot.exit()
                .transition()
                .duration(300)
                .ease(d3.easeSin)
              .attr("r", 0)
              .remove();

};

function xAxis(scale) {

    var xAxis = d3.axisBottom(scale)
                   .ticks(5)
                   .tickSizeInner(- height + margin.bottom + margin.top )
                   .tickSizeOuter(0)
                   .tickPadding(8);

    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom - margin.top)  + ")" )
        .attr("class", "xAxis")
        .call(xAxis);

};

function yAxis(scale) {

     var yAxis = d3.axisLeft(scale)
                    .ticks(5)
                    .tickSizeInner(- width)
                    .tickSizeOuter(0)
                    .tickPadding(8);

     svg.append("g")
         .attr("transform", "translate(0,0)")
         .attr("class", "yAxis")
         .call(yAxis);
};

function mouseOver(d) {

        tooltip.transition()
               .duration(300)
               .style("opacity", 0.9);

        tooltip.html("<p><b>" + d.sport + "</b> | "
                    + d.discipline + "</p>"
                    + "<p>Competitividade: " + formatNum(d.competitiveness) + "</p>"
                    + "<p>Viabilidade: " + formatNum(d.viability) + "</p>")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
              };

function mouseOut() {
        tooltip.transition()
               .duration(50)
               .style("opacity", 0);
              };

var formatNum = d3.format(",.3f");
