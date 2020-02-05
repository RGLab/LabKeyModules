import * as d3 from 'd3';
import { ScatterPlotProps } from '../similarStudyScatterPlot';

export function drawScatterPlot(props: ScatterPlotProps) {
    
    console.log(props)

    // props
    const data = props.data;
    const name = props.name;
    const prettyName = makeNamePretty(name)
    const dataRange = props.dataRange;
    const linkBaseText = props.linkBaseText;
    const categoricalVar = props.categoricalVar
    const colorIndex = props.colorIndex
    const dataType = props.dataType

    

    // Helper
    function makeNamePretty(string){
        // find uppercase letters
        console.log(string)
        var positions = [];
        for(var i = 0; i < string.length; i++){
            if(string[i].match(/[A-Z]/) != null){
                positions.push(i);
            }
        }

        if(positions.length > 0){
            // insert space before index in positions
            const separateStrings = []
            for(var x = 0; x < positions.length; x++){
                var start, end;
                if(x == 0){
                    start = 0
                    end = positions[0]
                }else{
                    start = positions[x - 1]
                    end = positions[x]
                }
                const word = string.slice(start,end)
                const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1)
                separateStrings.push(capitalizedWord)
            }
            const lastWord = string.slice(positions[positions.length-1])
            separateStrings.push(lastWord)

            return(separateStrings.join(' '))
        }else{
            const capitalizedWord = string.charAt(0).toUpperCase() + string.slice(1)
            return(capitalizedWord)
        }
        
    }

    // Create custom color array with 17 colors (max needed) for cat vars
    var customColorArray = d3.schemeCategory10.concat(d3.schemeCategory10)
    customColorArray.splice(7, 1)
    customColorArray.splice(16, 1)

    // Create mapping to different ordinal color schemes for study design set
    const ordinalColorOptions = [
        'interpolateBlues',
        'interpolateGreens',
        'interpolateOranges'
    ]
    
    function getFillColor(label, categoricalVar, index, value){
        if(categoricalVar == true){
            return(getCategoricalColor(index, value))
        }else{
            return(getOrdinalColor(index, label, value))
        }
    }

    function getCategoricalColor(index, value){
        if(value == 0){
            return('#D3D3D3') // grey
        }else{
            return(customColorArray[index])
        }
    }

    function getOrdinalColor(index, label, value){
        var interpolationScheme = ordinalColorOptions[index]
        const range = getRangeFromIntArray(data, dataType, label)
        const percentage = getPercentageFromValue(value, range)
        return(d3[interpolationScheme](percentage))
    }

    function getRangeFromIntArray(data, dataType, label){
        const values = data.map(a => parseFloat(a[dataType][label]))
        const max = Math.max(...values)
        const min = Math.min(...values)
        return([min, max])
    }

    function getPercentageFromValue(value: number, range: number[]){
        return( (value - range[0]) / (range[1] - range[0]) )
    }

    
    // select div
    const svg = d3
        .select("#scatterplot-" + name)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "scatterplot-" + name); // why give it same id??

    // set margins
    const margin = {
                top: 50, 
                right: 30, 
                bottom: 30, 
                left: 30
        },
        width  = props.width - margin.left - margin.right,
        height = props.height - margin.top  - margin.bottom;

    // Set scales using arguments
    const xaxisScale = d3
        .scaleLinear()
        .domain(dataRange.x)
        .range([0, width]);

    const yaxisScale = d3
        .scaleLinear()
        .domain(dataRange.y)
        .range([height, 0])

    // Create body and axes - read more about d3.Selection
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "scatterplot" + name);
    
    // x-axis - no ticks
    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(d3.axisTop(xaxisScale).ticks([]))

    // x-axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", props.width / 2)
        .attr("y", margin.top / 2)
        .text(prettyName);

    // y-axis - no ticks
    svg.append("g")
        .attr("id", "yaxis-labels")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale).ticks([]))

    // add clickable-links
    // svg.selectAll("text")
    //     .filter(function(d){ return typeof(d) == "string"})
    //     .style("cursor","pointer")
    //     .on("mouseover", function(d, i){
    //         d3.select(this)
    //             .style("color","green")
    //             .style("font-weight", "bold")
    //     })
    //     .on("mouseout", function(d, i){
    //         d3.select(this)
    //             .style("color","black")
    //             .style("font-weight", "normal")
    //     })
    //     .on("click", function(d){ 
    //         document.location.href = linkBaseText + (d as String).split(': ')[1]
    //     })
    
    var tooltip = d3.select('#' + name)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
    
    //  add values
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("r", 3.5)
        .attr("cx", function(d){ return xaxisScale(d.x) + margin.left })
        .attr("cy", function(d){ return yaxisScale(d.y) + margin.top})
        .style("fill", function(d) { 
            const fill = getFillColor(name, categoricalVar, colorIndex, d[dataType][name])
            return(fill)
        }) 
        .on("mouseover", function(d){
            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9);		
            tooltip.html(
                    "<a href=" + linkBaseText + d.study + "/begin.view?>" + 
                    d.study + 
                    "</a>"
                )	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })		

//     // draw legend
//   var legend = svg.selectAll(".legend")
//   .data(color.domain())
// .enter().append("g")
//   .attr("class", "legend")
//   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// // draw legend colored rectangles
// legend.append("rect")
//   .attr("x", width - 18)
//   .attr("width", 18)
//   .attr("height", 18)
//   .style("fill", color);

// // draw legend text
// legend.append("text")
//   .attr("x", width - 24)
//   .attr("y", 9)
//   .attr("dy", ".35em")
//   .style("text-anchor", "end")
//   .text(function(d) { return d;})
}