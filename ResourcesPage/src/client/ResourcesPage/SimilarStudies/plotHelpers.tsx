
import React from "react"
import {
    ScatterPlotProps,
    ScatterPlot,
} from '../PlotComponents/similarStudyScatterPlot'

interface plotPropsList {
    plotPropsList: ScatterPlotProps[];
}

export const PlotGrid = React.memo<plotPropsList>(( { plotPropsList }: plotPropsList) => {
    return(
        <div>
            <table>
                <tbody>
                    {CreatePlotGrid(plotPropsList)}
                </tbody>
            </table>
        </div>
    )
})
 
function CreatePlotGrid (propsList: ScatterPlotProps[]){
    const rowsOfPlots = []
    const PLOTS_IN_ROW = 4

    // slice returns i to end of array even if i + x is greater than Array.length
    for(var i = 0; 
        i <= propsList.length - PLOTS_IN_ROW + 1; 
        i = i + PLOTS_IN_ROW){
            var copy = JSON.parse(JSON.stringify(propsList))
            var propsSet = copy.slice(i, i + PLOTS_IN_ROW)
            rowsOfPlots.push(CreateRowOfPlots(propsSet, i))
    }

    return(rowsOfPlots)
}
    
function CreateRowOfPlots(propsSet, index){
    const plotList = []
    for(var i = 0; i < propsSet.length; i++){
        plotList.push(CreateSingleScatterPlot(propsSet[i]))
    }

    return(
        <tr key={'plot-row-' + index}>
            {plotList}
        </tr>
    )
}

function CreateSingleScatterPlot(props){
    return(
        <td key={props.name}>
            <ScatterPlot
                data={props.data}
                name={props.name}
                width={props.width}
                height={props.height}
                dataRange={props.dataRange}
                linkBaseText={props.linkBaseText}
                colorIndex={props.colorIndex}
                categoricalVar={props.categoricalVar}
                dataType={props.dataType}
            />
        </td>
    )
}