// React stuff ==================================== //

function BarplotController(props) {
    const dfcube = props.dfcube;
    const countFilter = props.countFilter;
    const [data, setData] = React.useState([])

    // Get the data from the cube
    dfcube.onReady((mdx) => {
        mdx.query({
            "sql": true,
            configId: "DataFinder:/DataFinderCube",
            schemaName: 'immport',
            success: function (cs, mdx, config) {
                console.log(cs);
                data_tmp = formatBarplotData(cs);
                setData(data_tmp);
            },
            name: 'DataFinderCube',
            onRows: { level: "[Data.Assay].[Timepoint]", members: "members" },
            countFilter: countFilter,
            countDistinctLevel: "[Subject].[Subject]"
        });
    })

    function formatBarplotData(cs) {
        return (
            [
                { label: "Female", value: 55 },
                { label: "Male", value: 14 },
                { label: "Other", value: 31 }
            ]
        )
    }

    return (
        <div>
            <Barplot
                data={data}
                height={250}
                name={"gender"}
                width={800}
            />
        </div>
    );
}
console.log(BarplotController);

function Barplot(props) {
    React.useEffect(() => {
        if (props.data.length > 0) {
            drawBarplot(props);
        }
    });

    return <div className={props.name} />;
}


// ================================================================== //
/* 
This is a barplot component which takes the following arguments in 
the props: 
  * data
  * name (id for the div to stick it in)
  * width
  * height

*/

function drawBarplot(props) {
    const data = props.data;
    const name = props.name;
    const labels = [];
    const dataRange = [0, 0];

    data.map((e, i) => {
        labels.push(e.label);
        if (e.value > dataRange[1]) dataRange[1] = e.value;
    });


    d3.select("." + name + " > *").remove();
    var svg = d3
        .select("." + name)
        .append("svg")
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("id", "barplot-" + name);

    // Create margins
    var margin = { top: 20, right: 0, bottom: 40, left: 175 },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;

    // Set scales using options

    var xaxisScale = d3
        .scaleBand()
        .domain(labels)
        .range([0, width]);

    var yaxisScale = d3
        .scaleLinear()
        .domain(dataRange)
        .range([height, 0]);

    // Create body and axes
    // svg.append("g")
    //     .call(d3.axisLeft(yaxisScale));

    // svg.append("g")
    //     .call(d3.axisBottom(xaxisScale));

    if (svg.selectAll("g").empty()) {
        var barplot = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("id", "barplot" + name);
    } else {
        var barplot = svg.select("#barplot" + name)
    }

    svg.append("g")
        .attr("id", "xaxis-labels")
        .attr(
            "transform",
            "translate(" + margin.left + ", " + (height + margin.top) + ")"
        )
        .call(d3.axisBottom(xaxisScale));

    svg.append("g")
        .attr("id", "yaxis-labels")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(yaxisScale));

    // add data
    var boxes = barplot.selectAll("rect").data(data);
    boxes
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xaxisScale(d.label);
        })
        .attr("width", xaxisScale.bandwidth() - 5)
        .attr("y", function (d) {
            return yaxisScale(d.value);
        })
        .attr("height", function (d) {
            return height - yaxisScale(d.value);
        })
        .style("fill", "steelblue")


    boxes.exit().remove();
}
