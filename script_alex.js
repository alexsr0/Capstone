
//on reloading/refreshing the site, automatically scroll to the top
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

//////Select Dropdown Menu For Map///////
var data = ["Choose an Attribute", "schoolOECD", "waste", "lnyUN", "GINIW", "polity"];

var select = d3.select('#menu')
  .append('select')
    .attr('class','select')
    .on('change',onchange)

var options = select
  .selectAll('option')
  .data(data).enter()
  .append('option')
    .text(function (d) { return d; });

var selectValue = d3.select('select')
  .property('value');


//determine map and chart titles/ text based on new attribute
function setTitle() {
  if (selectValue == "Update Charts Below With New Attribute" || selectValue == "Choose an Attribute" || selectValue == "waste") {
  selectValue = "waste";
  title = "Food Security";
  } else if (selectValue == "schoolOECD") {
  title = "Secondary Net Enrollment";
  } else if (selectValue == "polity") {
  title = "Democracy";
  } else if (selectValue == "GINIW") {
  title = "Inequality";
  } else if (selectValue == "lnyUN") {
  title = "GDP Per Capita";
  }

  return title;
}

//////Variable and Function Declaration///////

//set height and width of svg
var svg = d3.select("#svgmap"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var tooltip = d3.select("div.tooltip");
var tooltipSct = d3.select("div.tooltipSct");


//link to data files
hostdata = "Milestone2.csv"
jsondata ="world-110m.geojson"

// Map and projection
//define path
var path = d3.geoPath();
//define projection boundaries
var projection = d3.geoNaturalEarth()
  .scale(175)//change this to zoom. original values: width / 2 / Math.PI
  .translate([(width / 2)-20, height / 2])
var path = d3.geoPath()
  .projection(projection);

// Declare data attributes for mapping
var data = d3.map();
var polity = d3.map();
var schoolOECD = d3.map();
var lnyUN = d3.map();
var gin = d3.map();
var country_name = d3.map()
var waste = d3.map()
var region = d3.map()
var code = d3.map()

//set colors for map
var colorScale = d3.scaleThreshold()
.domain([1, 3, 5, 7, 9, 11])
.range(["#EFEDEB", "#D45810", "#EF935D", "#FBAF83", "#D9C3B6", "#8C7C72"]);

var labels = ['-', '1-2', '3-4', '5-6', '7-8', '9-10', '> 10'];
var legend = d3.legendColor()
  .labels(function (d) { return labels[d.i]; })
  .shapePadding(4)
  .scale(colorScale);

//Load external data and set attributes
d3.queue()
  .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
  .defer(d3.csv, hostdata, function(d) {
    data.set(d["Country Code"], +d.waste);
    polity.set(d["Country Code"], +d.polity);
    lnyUN.set(d["Country Code"], +d.lnyUN);
    gin.set(d["Country Code"], +d.GINIW);
    schoolOECD.set(d["Country Code"], +d.schoolOECD);
    waste.set(d["Country Code"], +d.waste);
    country_name.set(d["Country Code"], d["Country Name"]);
    region.set(d["Country Code"], d.Region);
    code.set(d["Country Code"], d["Country Code"]);

    })
  .await(ready);

//functions to set the data variables
function setReg(d) {
  d.region = region.get(d.id) || 0;
  return d.region;
}

//function to occur on .mousemove event on the map
function mousemovef(d){
  //get the data values to display in the tooltip for the map
  d.polity = polity.get(d.id) || "-";
  d.lnyUN = lnyUN.get(d.id) || "-";
  d.schoolOECD = schoolOECD.get(d.id) || "-";
  d.gin = gin.get(d.id) || "-";
  d.waste = waste.get(d.id) || "-";
  d.country_name = country_name.get(d.id) || "-";
  d.region = region.get(d.id) || "-";

  //change map opacity based on regions
  if (d.region != "-") {
    d3.selectAll("path")
      .attr('fill-opacity', 0.6);
    d3.selectAll("#" + d.region)
      .attr('fill-opacity', 1);
  } else {
    d3.select(this).attr("stroke-width",1);
    d3.selectAll("path")
      .attr('fill-opacity', 1);
  }
  //build tooltip for map
  var mouse = d3.mouse(this);
  tooltip.classed("hidden", false)
    .style("top", (d3.event.pageY -300) + "px")
    // (mouse[1]+ 20) + "px")
    .style("left", (d3.event.pageX - 250) + "px")
    // (mouse[0] + 40) + "px")
    .html("<strong>Country: </strong>" + d.country_name +
      "<br><strong>Region: </strong>" + d.region +
      "<br><strong>Food Security: </strong>" +d.waste +
      "<br><strong>Democracy: </strong>" + d.polity +
      "<br><strong>GDP Per Capita: </strong>" + d.lnyUN +
      "<br><strong>Secondary Net Enrollment: </strong>" + d.schoolOECD +
      "<br><strong>Inequality: </strong>" + d.gin);
}

//function to occur on the mouseover event on the map
function mouseoverf(d,i){
  d.region = region.get(d.id) || "-";
  if (d.region != "-") {
    d3.select(this).attr("stroke-width",2);
    d3.selectAll("path")
      .attr('fill-opacity', 0.6);
    d3.selectAll("#" + d.region)
      .transition().duration(100)
      .attr('fill-opacity', 1);
    return tooltip.style("hidden", false).html(d.waste+"1");
  } else {
    d3.select(this).attr("stroke-width",1);
    d3.selectAll("path")
      .attr('fill-opacity', 1);
  }
}

//function to occur on the mouseout event of map
function mouseoutf(d,i){
  d3.select(this).attr("stroke-width",1);
  d.region = region.get(d.id) || "-";
  d3.selectAll("path")
    .attr('fill-opacity', 1);
  tooltip.classed("hidden", true);
}

//functions to occur on mousemove and mouseout of scatterplot
function mouseoutsc(d) {
    tooltipSct.classed("hidden", true);
}

function mousemovesc(d) {
  var mouse = d3.mouse(this);
  console.log("sctmouse", mouse);
    if (d["Country Name"] == bar_data[0].country || d["Country Name"] == bar_data[1].country || d["Country Code"] == bar_data[2].country) {
        var valu = d[selectValue];
        var value = (Math.floor(valu * 100) / 100 );

        var valu1 = d.lnyUN;
        var value1 = (Math.floor(valu1 * 100) / 100 );

        tooltipSct.classed("hidden", false)
          .style("top", (mouse[1]) + "px")
          .style("left", (mouse[0]) + "px")
          .html(
            "<strong>" + d["Country Name"] + "</strong>" +
            "<br><strong>" + title + "</strong>: " + value +
            "<br><strong>GDP: </strong> " + value1 )
          }
}


//set radius of circles for scatterplot
function radius(d){
  if (d["Country Name"] == bar_data[0].country || d["Country Code"] == bar_data[1].country || d["Country Code"] == bar_data[2].country) {
    size = 7.5;
    return size;
  } else {
    size = 3.5;
    return size;
  }
}

//set color values of circles in scatterplot
function dotFill(d) {
  if (d[selectValue] <= 2) {
    color = "#D45810";
    return color;
  } else if (d[selectValue] > 2 && d[selectValue] <= 4) {
    color = "#D45810";
    return color;
  } else if (d[selectValue] > 4 && d[selectValue] <= 6) {
    color = "#FBAF83";
    return color;
  } else if (d[selectValue] > 6 && d[selectValue] <= 8) {
    color = "#D9C3B6";
    return color;
  } else if (d[selectValue] > 8) {
    color = "#8C7C72";
    return color;
  } else {
    color = "#EFEDEB";
    return color;
  }
}


		// Takes 5 parameters:
    // (1) Your data
    // (2) The column of data plotted on your x-axis
    // (3) The column of data plotted on your y-axis
    // (4) The minimum value of your x-axis
    // (5) The minimum value of your y-axis

    // Returns an object with two points, where each point is an object with an x and y coordinate

function calcLinear(d, x, y, minX, minY){
      /////////
      //SLOPE//
      /////////


      // Let n = the number of data points
      var n = d.length;
      console.log("length of data", n);

      // Get just the points
      var pts = [];
      d.forEach(function(d,i){

        var obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
      });

      console.log(pts);

      // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
      // Let b equal the sum of all x-values times the sum of all y-values
      // Let c equal n times the sum of all squared x-values
      // Let d equal the squared sum of all x-values
      var sum = 0;
      var xSum = 0;
      var ySum = 0;
      var sumSq = 0;
      pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
      });
      var a = sum * n;
      var b = xSum * ySum;
      var c = sumSq * n;
      var d = xSum * xSum;
      console.log("a", a);
      console.log("b", b);
      console.log("c", c);
      console.log("d", d);




      // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
      // slope = m = (a - b) / (c - d)
      var m = (a - b) / (c - d);
      console.log("slope",m);
      /////////////
      //INTERCEPT//
      /////////////

      // Let e equal the sum of all y-values
      var e = ySum;
      console.log("sum y val", e);

      // Let f equal the slope times the sum of all x-values
      var f = m * xSum;
      console.log("sum x val", f);


      // Plug the values you have calculated for e and f into the following equation for the y-intercept
      // y-intercept = b = (e - f) / n
      var b = (e - f) / n;
      console.log("y int", b);
      console.log("y = ", m, "x + ", b)



			// Print the equation below the chart
			// document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
			// document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;

      // return an object of two points
      // each point is an object with an x and y coordinate
      if (m<1) {
        y2cal = (10 * m) + b;
        x2cal = 10;
      } else {
        y2cal = 10;
        x2cal = (10 - b) / m;
      }


      return {
        ptA : {
          x: 0,
          y: m * minX + b
        },
        ptB : {
          y: y2cal,
          x: x2cal
          // (10 - b) / m
        }
      }
      console.log(ptA);

}


// function getDivWidth (div) {
//   var widthdiv = d3.select(div)
//     // get the width of div element
//     .style('width')
//     // take of 'px'
//     .slice(0, -2)
//   // return as an integer
//   return Math.round(Number(widthdiv))
// }
//
// function getDivHeight (div) {
//   var heightdiv = d3.select(div)
//     // get the width of div element
//     .style('height')
//     // take of 'px'
//     .slice(0, -2)
//   // return as an integer
//   return Math.round(Number(heightdiv))
// }

//declare variables for the scatterplot
var xValueSct = function(d) {
  d.lnyUN = lnyUN.get(d.id) || "0";
  return d.lnyUN;
} // data -> value

var yValueSct = function(d) {
  d[selectValue] = data.get(d.id) || "0";
  return d[selectValue];
}  // data -> value

var marginsct = {top: 70, right: 30, bottom: 30, left: 50},
    // widthsct = getDivWidth("#scatterdiv"),
    // heightsct = getDivHeight("#scatterdiv");

    xScaleSct = d3.scaleLinear()
      .domain([0, 10])
      .range([0, 550]), // value -> display  .domain([0, 10])
    xMapSct = function(d) {
        return xScaleSct(xValueSct(d))
    ;}, // data -> display
    xAxisSct = d3.axisBottom().scale(xScaleSct).ticks(5);

    yScaleSct = d3.scaleLinear()
      .domain([0, 10])
      .range([350, 0]),
    yMapSct = function(d) { return yScaleSct(yValueSct(d));}, // data -> display
    yAxisSct = d3.axisLeft().scale(yScaleSct).ticks(5);

//responsive map functionality
var chart = $("#svgmap"),
  aspect = chart.width() / chart.height(),
  container = chart.parent();
$(window).on("resize", function() {
  var targetWidth = container.width();
  chart.attr("width", targetWidth);
  chart.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");

var bar_chart = $("#svgbar"),
  aspect_bar = bar_chart.width() / bar_chart.height(),
  container_bar = bar_chart.parent();
$(window).on("resize", function() {
  var targetWidth_bar = container_bar.width();
  bar_chart.attr("width", (targetWidth_bar * .8));
  bar_chart.attr("height", Math.round((targetWidth_bar / aspect_bar)*0.8));
}).trigger("resize");


var sct_chart = $("#svgscatter"),
  aspect_sct = sct_chart.width() / sct_chart.height(),
  container_sct = sct_chart.parent();
$(window).on("resize", function() {
  var targetWidth_sct = container_sct.width();
  sct_chart.attr("width", targetWidth_sct * 0.8);
  sct_chart.attr("height", Math.round((targetWidth_sct / aspect_sct)));
}).trigger("resize");

//Table svg
var table_chart = $("#svgtable"),
  aspect_table = table_chart.width() / table_chart.height(),
  container_table = table_chart.parent();
$(window).on("resize", function() {
  var targetWidth_table = container_table.width();
  table_chart.attr("width", (targetWidth_table * .8));
  table_chart.attr("height", Math.round((targetWidth_table / aspect_table)*0.8));
}).trigger("resize");

//function called when user clicks on a country in the map
function createcharts(d){
  d3.select("#chartwrapper").classed("hidden", false);

  //on click, scroll down to details in section below
  $('html,body').animate({
        scrollTop: $("#chartwrapper").offset().top},
        'slow');

  //remove second dropdown menu to start from scratch
  d3.select("#menu2").selectAll("select").remove();
  d3.select("#chartheader").selectAll().remove();
  d3.select("#scrollup").selectAll("button").remove();
  d3.select("#tablediv").selectAll("table").remove();

  //set background color of details section
  d3.select("#chartwrapper").style("background-color", "#F9F8F8");
  d3.select("#scrollup").classed("hidden", false);


  //build second drop down menu for details
  var data2 = ["Update Charts Below", "schoolOECD", "waste", "lnyUN", "GINIW", "polity"];
  var select2 = d3.select('#menu2')
    .attr("margin-top", "14%")
    .append('select')
      .attr('class','select')
      .on('change', updatecharts) //when this second menu is changed, calls fxn updatacharts

  var options2 = select2
    .selectAll('option')
    .data(data2).enter()
    .append('option')
      .attr("margin-top", "1.5%")
      .text(function (d) { return d; });

      d.country_code = code.get(d.id) || "-";
      d.country_name = country_name.get(d.id) || "-";
      d.region = region.get(d.id) || "-";

      mapcountry = d.country_name;
      mapregion = d.region;
      mapcode = d.country_code;

  origselect = d3.select("#menu").selectAll("select").property("value");
  console.log("orig", origselect);
  console.log("country", mapcountry);
  console.log("reg", mapregion);
  console.log("code", mapcode);
  // console.log("region", fullregion);


  //reload data, call fxn buildcharts
  d3.queue()
    .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, hostdata, function(d) {
      data.set(d["Country Code"], +d[selectValue]);
    })
    .await(buildcharts);
}

//builds the bar and scatterplots
function buildcharts(error, d) {

  if (error) throw error;
  console.log("buildcharts", selectValue);
  console.log("buildcharts", mapcountry);
  console.log("buildcharts", mapregion);

  //remove existing charts
  d3.select("#svgbar").selectAll("g").remove();
  d3.select("#svgscatter").selectAll("g").remove();
  d3.select("#bardiv").selectAll("svg").remove();
  d3.select("#bardiv").selectAll("rect").remove();
  d3.select("#scatterdiv").selectAll("svg").remove();
  d3.select("#svgscatter").selectAll(".dot").remove();
  d3.select("#chartheader").selectAll("p").remove();
  d3.select("#chartheader").selectAll("hr").remove();
  d3.select("#scrollup").selectAll("button").remove();
  d3.select("#tablediv").selectAll("table").remove();



  d3.select("#chartheader")
    .append("p")
      .attr("id", "titleheader")
      .html(title)
  d3.select("#chartheader")
    .append("p")
      .attr("id", "geoheader")
      .html(mapcountry + ", " + mapregion);
  d3.select("#chartheader")
    .append("hr")
      .attr("id", "hr");



  //create object to hold the bar chart data - country, region, and world values
  if (mapregion != "-") {
    new_id = mapregion;
    bar_data = [{country: mapcountry,
              value_bar: (d[selectValue] = data.get(mapcode))},
              {country: new_id,
              value_bar: (d[selectValue] = data.get(new_id))},
              {country: "World",
              value_bar: (d[selectValue] = data.get("World"))}
              ];

    console.log("bardata", bar_data[0], bar_data[1], bar_data[2]);
    //build bar chart
    const marginbar = 70;
    const widthbar = 700;
    const heightbar = 450;
    const svgbar = d3.select('#bardiv')
      .append("svg")
        .attr("width", "100%")
        .attr("height", 450)
        .attr("padding-bottom", "5%")
        .attr("viewBox", "0 0 700 450");
    const chartbar = svgbar.append('g')
      .attr('transform', `translate(100, 50)`);
    //
    const yScaleBar = d3.scaleLinear()
      .range([350, 0])
      .domain([0, 10]);

    //x axis
    const xScaleBar = d3.scaleBand()
      .range([0, 550])
      .domain(bar_data.map((s) => s.country))
      .padding(0.25);

    //y axis
    xaxbar = d3.axisLeft().scale(yScaleBar).ticks(5);
    chartbar.append('g')
      .attr('id', "yscalebar")
      .call(xaxbar)
      .style("font-size", '1.2em');

    //x axis, labels
    chartbar.append('g')
      .attr("id", "labels")
      .attr('transform', `translate(0, 350)`)
      .call(d3.axisBottom(xScaleBar))
      .style("font-size", '1.2em');

    //bars
    chartbar.selectAll()
      .data(bar_data)
      .enter()
      .append('rect')
      .attr("class", "bar")
      .attr("fill", (s) => colorScale(s.value_bar))
      .attr('x', (s) => xScaleBar(s.country))
      .attr('y', (s) => yScaleBar(s.value_bar))
      .attr('height', (s) => 350 - yScaleBar(s.value_bar))
      .attr('width', xScaleBar.bandwidth());

    xlabel = function(s) {
      valuebar = s.value_bar;

      if (isNaN(s.value_bar)) {
        valuebar_round = " ";
      } else {
        valuebar_round = (Math.floor(valuebar * 100) / 100 );
      }

      return valuebar_round;
    }

    chartbar.selectAll()
      .data(bar_data)
      .enter()
      .append('text')
        .attr("id","datalabels")
        .text(xlabel)
        .style("font-size", '1.3em')
        .style("color", 'white')
        .style("font-weight", 'bold')
        .attr("x", (s) => xScaleBar(s.country)+ 47)
        .attr("y", (s) => yScaleBar(s.value_bar) + 30);

  };


  //Data table test
var tabulate = function (data,columns) {
 var thead = d3.select('#tablediv').append('table');
 
  thead.selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text(function (d) { return d });
	



 var rows = thead.selectAll('tr').data(data).enter().append('tr');
//var filteredrows = rows.filter(function(data,i){return i == 1;});
 var filteredrows= rows.filter(function(row){
	 return row['Country Name'] == bar_data[0].country;
	
 }) ;
 
  var worlddata = rows.filter(function(w){

	 return w['Country Name'] == 'World';
 }) ;
 
 
  var cells = filteredrows.selectAll('td')
    .data(function(row) {
      return columns.map(function (column) {
        return { column: column, value: row[column] }
		
      })
    })
    .enter()
    .append('td')
    .text(function (d) { return d.value });
	
	//Adds the World row in the data table.
	 var addworld = worlddata.selectAll('td')
    .data(function(row) {
      return columns.map(function (column) {
        return { column: column, value: row[column] }
		
      })
    })
    .enter()
    .append('td')
    .text(function (d) { return d.value });

}




	 
d3.csv('milestone2.csv',function (data) {
 var columns = ['Country Name','waste','GINIW','polity','lnyUN']
 
 tabulate(data,columns)
})





  //reload data for scatter chart **currently in progress**
  d3.csv(hostdata,function(data){

      linevalues = [];
      yvalues = [];

      data.forEach(function(d,i){
        var obj = {};
        if (isNaN(d.lnyUN) || isNaN(d[selectValue])){
          return false;
        } else {
          obj.x = +d.lnyUN;
          obj.y = +d[selectValue];
          obj.mult = obj.x*obj.y;
          linevalues.push(obj);
        }
      })
      console.log(linevalues);

      var lg = calcLinear(linevalues, "x", "y", 0, 0);

      const svgSct = d3.select('#scatterdiv')
        .append('svg')
          .attr("width", "100%")
          .attr("height", 450)
          .attr("padding-bottom", "5%")
          .attr("viewBox", "0 0 700 450");

      const chartSct = svgSct.append('g')
        .attr("transform", "translate(50, 50)");

      // add the tooltip area to the webpage
      var tooltipSct = d3.select("div.tooltipSct");
      // x-axis
      chartSct.append("g")
         .attr("id", "xaxis")
         .attr("transform", "translate(0, 350)")
         .call(xAxisSct)
         .style("font-size", '1.2em')
       .append("text")
         .attr("class", "caption")
         .attr("x", 550)
         .attr("y", -6)
         .style("text-anchor", "end")
         .text("GDP Per Capita");

         // y-axis
      chartSct.append("g")
          .attr("id", "yaxis")
          .call(yAxisSct)
          .style("font-size", '1.2em')
        .append("text")
          .attr("class", "caption")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(title);

      //draw regression line
      x1 = xScaleSct(lg.ptA.x);
      y1 = yScaleSct(lg.ptA.y);
      x2 = xScaleSct(lg.ptB.x);
      y2 = yScaleSct(lg.ptB.y);

      chartSct.append("g")
        .append("line")
	        .attr("class", "regression")
	        .attr("x1", x1)
	        .attr("y1", y1)
	        .attr("x2", x2)
	        .attr("y2", y2);

        // draw dots
      chartSct.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("id", function (d) {
            return d["Country Code"];
          })
          .attr("r", radius)
          .attr("cx", (d)=> xScaleSct(d.lnyUN))
          .attr("cy", (d)=> yScaleSct(d[selectValue]))
          .style("fill", dotFill)
          .style("opacity", function(d){
            if (d["Country Name"] == bar_data[0].country) {
              opacity = 1;
              return opacity;
            } else if (d["Country Name"] == bar_data[1].country) {
              opacity = 1;
              return opacity;
            } else if (d["Country Code"] == bar_data[2].country) {
              opacity = 1;
              return opacity;
            } else if (isNaN(d.lnyUN) || isNaN(d[selectValue])) {
              opacity = 0;
              return opacity;
            } else {
              opacity = 0.25;
              return opacity;
            }
          })
          .on("mousemove", mousemovesc)
          .on("mouseout", mouseoutsc);
    })

  d3.select("#scrollup")
    .append("button")
      .attr("id", "scrolluplink")
      .text("Scroll up to map")
      .on("click", function(){
        $('html,body').animate({
              scrollTop: $("#heading").offset().top},
              'slow');

      });


}

//updates charts when new variable selected from second drop down
function updatecharts() {

  //get new variable and set titles
  selectValue = d3.select("#menu2").select('select').property('value');
  console.log("update", selectValue);
  setTitle();

  console.log("updatedtitle", title);

  //remove existing charts
  d3.select("#svgbar").selectAll("g").remove();
  d3.select("#svgscatter").selectAll("g").remove(); //remove existing scatter chart
  d3.select("#svgbar").selectAll("g").remove();
  d3.select("#svgbar").selectAll("rect").remove();
  d3.select("#svgscatter").selectAll("g").remove();
  d3.select("#svgscatter").selectAll(".dot").remove();
  d3.select("#chartheader").selectAll("p").remove();
  d3.select("#chartheader").selectAll("hr").remove();
  d3.select("#scrollup").selectAll("button").remove();
  d3.select("#tablediv").selectAll("table").remove();



  //reload data
  d3.queue()
    .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, hostdata, function(d) {
      data.set(d["Country Code"], +d[selectValue]);
      })
    .await(buildcharts); //call buildcharts but pass in the new variable

}


//what happens when a new attribute is selected from main map menu: repopulate map with new data
function onchange() {
  //set the new attribute value selected
  selectValue = d3.select('select').property('value');
  console.log(selectValue);
  setTitle();
  console.log(title);

  //delete the map and chart previously there so they don't show up together
  d3.select("#svgmap").selectAll("g").remove();
  d3.select("#svgmap").selectAll("text").remove();
  d3.select("#svgbar").selectAll("g").remove();
  d3.select("#bardiv").selectAll("svg").remove();
  d3.select("#bardiv").selectAll("rect").remove();
  d3.select("#scatterdiv").selectAll("svg").remove();
  d3.select("#menu2").selectAll("select").remove();
  d3.select("#chartheader").selectAll("p").remove();
  d3.select("#chartheader").selectAll("hr").remove();
  d3.select("#scrollup").selectAll("button").remove();
  d3.select("#tablediv").selectAll("table").remove();

  d3.select("#chartwrapper").classed("hidden", true);
  // // Load external data and boot
  d3.queue()
    .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, hostdata, function(d) {
      data.set(d["Country Code"], +d[selectValue]);
    })
    .await(ready); //call fxn ready which builds map
}

function ready(error, topo, info) {
  if (error) throw error;
  d3.selectAll("path").remove();

  //map title
  svg.append("text")
    .attr("x", (width/2))
    .attr("y", 55)
    .attr("font-size", "36px")
    .attr("text-anchor", "middle")
    .text(setTitle)

  // // Legend
  var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(30,340)");
  g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .attr("text-anchor", "middle")
    .text(setTitle);
  var labels = ['-', '1-2', '3-4', '5-6', '7-8', '9-10', '> 10'];
  var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
  svg.select(".legendThreshold")
    .call(legend);


  svg.append("g")
    .attr("class", "countries")
    .attr("transform", "translate(0,60)")
    .selectAll("path")
    .data(topo.features)
    .enter().append("path")
      .attr("id", setReg)
      .attr("fill", function (d){
          d[selectValue] = data.get(d.id) || 0;
          return colorScale(d[selectValue]);
      })
      .attr("d", path)
      .on("mouseover", mouseoverf)
      .on("mousemove", mousemovef)
      .on("click", createcharts) //call createcharts to build bar and scatter
      .on("mouseout", mouseoutf);
    }
