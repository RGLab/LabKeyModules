import React from "react";
import {DropdownButton, MenuItem, Tab, TabPane, TabContainer} from 'react-bootstrap';
import {
    ScatterPlotProps,
    ScatterPlot,
    ScatterPlotDataRange,
    ScatterPlotDatum
} from './PlotComponents/similarStudyScatterPlot'
import {DROPDOWN_OPTIONS, LABELS} from './SimilarStudies/constants'
import {makePropsWithIndex} from './SimilarStudies/utils'
                  

interface props {
    transformedSsData: ScatterPlotDatum[];
    ssDataRange: ScatterPlotDataRange;
    labkeyBaseUrl: string;
}

// ---- Main ------
export const SimilarStudies = React.memo<props>( ( {transformedSsData, ssDataRange, labkeyBaseUrl}: props) => {
    
    const [ssPlotPropsList, setSsPlotPropsList] = React.useState<Object>()
    const [plotsToShow, setPlotsToShow] = React.useState(DROPDOWN_OPTIONS[0].value)

    React.useEffect(() => {
        const plotPropsList = {}
    
        Object.keys(LABELS).forEach(function(key){
            const subList = []
            LABELS[key].forEach(function(label, index){
                subList.push(makePropsWithIndex(
                    transformedSsData, 
                    label, 
                    key,
                    ssDataRange,
                    labkeyBaseUrl,
                    index
                    )
                )
            })
            plotPropsList[key] = subList
        })

        setSsPlotPropsList(plotPropsList)
    
    }, [transformedSsData, ssDataRange])  

    const CreatePlotGrid = React.useCallback((propsList: ScatterPlotProps[]) => {
        const rowsOfPlots = []
        const PLOTS_IN_ROW = 4
    
        // slice returns i to end of array even if i + x is greater than Array.length
        for(var i = 0; 
            i <= propsList.length - PLOTS_IN_ROW + 1; 
            i = i + PLOTS_IN_ROW){
                var copy = JSON.parse(JSON.stringify(propsList))
                var propsSet = copy.slice(i, i + PLOTS_IN_ROW)
                rowsOfPlots.push(CreateRowOfPlots(propsSet))
        }
    
        return(rowsOfPlots)
    },[ssPlotPropsList])
    
    const CreateRowOfPlots = React.useCallback((propsSet) => {
        const plotList = []
        for(var i = 0; i < propsSet.length; i++){
            plotList.push(CreateSingleScatterPlot(propsSet[i]))
        }
    
        return(
            <tr>
                {plotList}
            </tr>
        )
    },[])
    
    const CreateSingleScatterPlot = React.useCallback((props) => {
        return(
            <td>
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
    },[])

    function onSelectChangePlot(eventKey){
        setPlotsToShow(eventKey)
    }

    const getDropDown = React.useCallback(() => {
        return(
            <div>
                <DropdownButton title='Select Plot Set' id='order-select-dropdown'>
                    <MenuItem eventKey={DROPDOWN_OPTIONS[0].value} key={DROPDOWN_OPTIONS[0].value} onSelect={onSelectChangePlot}>
                        {DROPDOWN_OPTIONS[0].label}
                    </MenuItem>
                    <MenuItem eventKey={DROPDOWN_OPTIONS[1].value} key={DROPDOWN_OPTIONS[1].value} onSelect={onSelectChangePlot}>
                        {DROPDOWN_OPTIONS[1].label}
                    </MenuItem>
                    <MenuItem eventKey={DROPDOWN_OPTIONS[2].value} key={DROPDOWN_OPTIONS[2].value} onSelect={onSelectChangePlot}>
                        {DROPDOWN_OPTIONS[2].label}
                    </MenuItem>
                </DropdownButton>
            </div>
        )
    }, [])

    interface plotPropsList {
        plotPropsList: ScatterPlotProps[];
    }

    const PlotGrid = React.memo<plotPropsList>(( { plotPropsList }: plotPropsList) => {
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

    const getTabContent = React.useCallback(() => {
        if(typeof(ssPlotPropsList) !== "undefined"){
            return(
                <Tab.Content>
                    <TabPane eventKey={DROPDOWN_OPTIONS[0].value}>
                        <PlotGrid plotPropsList={ssPlotPropsList[DROPDOWN_OPTIONS[0].value]} />
                    </TabPane>
                    <TabPane eventKey={DROPDOWN_OPTIONS[1].value}>
                        <PlotGrid plotPropsList={ssPlotPropsList[DROPDOWN_OPTIONS[1].value]} />
                    </TabPane>
                    <TabPane eventKey={DROPDOWN_OPTIONS[2].value}>
                        <PlotGrid plotPropsList={ssPlotPropsList[DROPDOWN_OPTIONS[2].value]} />
                    </TabPane>
                </Tab.Content>
            )
        }else{
            return(
                <div>
                    <i aria-hidden="true" className="fa fa-spinner fa-pulse" style={{marginRight:'5px'}}/>
                    Loading plots ...
                </div>
            )
        }
        
    }, [ssPlotPropsList, plotsToShow])

    const generateChildId = React.useCallback((eventKey: any, type: any) => {
        return eventKey;
    }, []);

    return(
        <TabContainer defaultActiveKey={plotsToShow} generateChildId={generateChildId}>
            <div>
                <h2>Similar Studies based on Assay Data or Study Design</h2>
                <p>The plots below show the results of a UMAP dimension reduction analysis of studies based on their meta-data, including assay data available, study design characteristics, and condition studied. Binary factor distance is measured using the Jaccard method, while continuous variables use Euclidean distance.</p>
                <p><b>For More Information:</b></p>
                <ul>
                    <li>Hover over a point for a link to the study overview page</li>
                    <li>Toggle between plots with LABELS for Assay Data Available, Study Design, or Condition Studied using the dropdown menu</li>
                </ul>
                <br></br>
                {getDropDown()}
                {getTabContent()}
            </div>
        </TabContainer>
    )
})