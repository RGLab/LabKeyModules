import React from "react";
import {MenuItem, Nav, Navbar, NavDropdown, NavItem, Tab, TabPane} from 'react-bootstrap';
import {
    ScatterPlotDatum,
    ScatterPlotProps,
    ScatterPlot
} from './components/similarStudyScatterPlot'


export const SimilarStudies = (transformedSsData, ssDataRange, labkeyBaseUrl) => {

    const labels = {
        assays: [
            'elisa',
            'elispot',
            'hai',
            'neutralizingAntibodyTiter',
            'geneExpression',
            'flowCytometry',
            'pcr',
            'mbaa'
        ],
        condition: [
            'healthy',
            'influenza',
            'cmv',
            'tuberculosis',
            'yellowFever',
            'meningitis',
            'malaria',
            'hiv',
            'dengue',
            'ebola',
            'hepatitis',
            'smallpox',
            'dermatomyositis',
            'westNile',
            'zika',
            'varicellaZoster',
            'unknown'
        ],
        studyDesign: [
            'minimumAge',
            'maximumAge',
            'numberOfParticipants',
            'clinicalTrial'
        ]
    }
    
    var categoricalLabels = labels.assays
                              .concat(labels.condition)
                              .concat('clinicalTrial')
    
    React.useEffect(() => {
        
        function getLabelType(label){
            if(labels.assays.includes(label)){
                return("assays")
            }else if(labels.condition.includes(label)){
                return("condition")
            }else{
                return("studyDesign")
            }
        }
    
        function makePropsWithIndex(label, index, dataType){
            // For plotting categorical values, ensure that colored dots
            // are plotted last to be visually on top by having them plot last
            transformedSsData.sort((a,b) => 
                (a[dataType][label] > b[dataType][label]) ? 1 : -1
            )
    
            // deep copy to ensure sort stays put
            const sortedData = JSON.parse(JSON.stringify(transformedSsData))
    
            let plotProps: ScatterPlotProps = {
                data: sortedData,
                name: label,
                width: 300,
                height: 300,
                dataRange: ssDataRange,
                linkBaseText: labkeyBaseUrl + "/project/Studies/",
                colorIndex: index,
                categoricalVar: categoricalLabels.includes(label),
                dataType: getLabelType(label)
            }
            
            return(plotProps)
        }
    
        const plotPropsList = {}
    
        Object.keys(labels).forEach(function(key){
            const subList = []
            labels[key].forEach(function(label, index){
                subList.push(makePropsWithIndex(label, index, key))
            })
            plotPropsList[key] = subList
        })
    
        setSsPlotPropsList(plotPropsList)
    
    }, [transformedSsData, ssDataRange])  

        // --- Similar Studies
        const [ssPlotsToShow, setSsPlotsToShow] = React.useState("assays")
        const [ssPlotPropsList, setSsPlotPropsList] = React.useState({})
        // Offer selection of plots
        const dropdownOptions = [
            {value: 'assays', label: 'Assay Data Available'},
            {value: 'studyDesign', label:  'Study Design'},
            {value: 'condition', label: 'Condition Studied'}
        ]

        function CreatePlotGrid(propsList){
            const rowsOfPlots = []
            const PLOTS_IN_ROW = 4

            // slice returns i to end of array even if i + x is greater
            // than the length
            for(var i = 0; 
                i <= propsList.length - PLOTS_IN_ROW + 1; 
                i = i + PLOTS_IN_ROW){
                    var copy = JSON.parse(JSON.stringify(propsList))
                    var propsSet = copy.slice(i, i + PLOTS_IN_ROW)
                    rowsOfPlots.push(CreateRowOfPlots(propsSet))
            }

            return(rowsOfPlots)
        }

        function CreateRowOfPlots(propsSet){
            // console.log(propsSet[0])
            const plotList = []
            for(var i = 0; i < propsSet.length; i++){
                plotList.push(CreateSingleScatterPlot(propsSet[i]))
            }

            return(
                <tr>
                    {plotList}
                </tr>
            )
        }

        function CreateSingleScatterPlot(props){
            // console.log(props)
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
        }

        const PlotGrid: React.FC = () => {
            const plotGrid = CreatePlotGrid(ssPlotPropsList[ssPlotsToShow])

            return(
                <div>
                    {plotGrid}
                </div>
            )
        }

        function onSelectChangeOrder(eventKey){
            setSsPlotsToShow(eventKey)
        }

        return(
            <div id="#similar-studies">
                <h2>Similar Studies based on Assay Data or Study Design</h2>
                <p>The plots below show the results of a UMAP dimension reduction analysis of studies based on their meta-data, including assay data available, study design characteristics, and condition studied. Binary factor distance is measured using the Jaccard method, while continuous variables use Euclidean distance.</p>
                <p><b>For More Information:</b></p>
                <ul>
                    <li>Hover over a point for a link to the study overview page</li>
                    <li>Toggle between plots with labels for Assay Data Available, Study Design, or Condition Studied using the dropdown menu</li>
                </ul>
                <br></br>
                <Bootstrap.DropdownButton title='Select Plot Set' id='order-select-dropdown'>
                    <Bootstrap.MenuItem eventKey={dropdownOptions[0].value} onSelect={onSelectChangeOrder}>
                        {dropdownOptions[0].label}
                    </Bootstrap.MenuItem>
                    <Bootstrap.MenuItem eventKey={dropdownOptions[1].value} onSelect={onSelectChangeOrder}>
                        {dropdownOptions[1].label}
                    </Bootstrap.MenuItem>
                    <Bootstrap.MenuItem eventKey={dropdownOptions[2].value} onSelect={onSelectChangeOrder}>
                        {dropdownOptions[2].label}
                    </Bootstrap.MenuItem>
                </Bootstrap.DropdownButton>
                <div>
                    <PlotGrid/>
                </div>
            </div>
        )
    }