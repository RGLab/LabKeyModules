import * as React from "react";
import {MenuItem, Nav, Navbar, NavDropdown, NavItem, Tab, TabPane} from 'react-bootstrap';
import {BarPlotDatum, BarPlotProps, BarPlotTitles} from './components/mostCitedBarPlot'

export const MostCited = (transformedPmData, pmDataRange) => {
    const [pmOrderBy, setPmOrderBy] = React.useState("studyNum")
    const [pmPlotData, setPmPlotData] = React.useState<BarPlotProps>({
        data: [{
            label: '',
            value: 0,
            hoverOverText: '',
            datePublishedStr: '',
            datePublishedFloat: 0,
            datePublishedPercent: 0,
            studyNum: 0
        }],
        titles: {
            x: '',
            y: '',
            main: ''
        },
        name: "",
        height: 500,
        width: 500,
        dataRange: [],
        linkBaseText: ''
    });

    React.useEffect(() => {
        transformedPmData.byPubId.sort((a,b) => (a[pmOrderBy] > b[pmOrderBy]) ? 1 : -1)
    
        // logic for updating titles
        const titles: BarPlotTitles = {
            x: 'Number of Citations',
            y: 'Study and PubMed Id',
            main: 'Number of Citations by PubMed Id'
        }
    
        // logic for updating props
        let plotProps: BarPlotProps = {
            data: transformedPmData.byPubId,
            titles: titles,
            name: "byPubId",
            width: 850,
            height: 700,
            dataRange: pmDataRange.byPubId,
            linkBaseText: 'https://www.ncbi.nlm.nih.gov/pubmed/'
        }
        setPmPlotData(plotProps)
    }, [transformedPmData, pmDataRange, pmOrderBy])
    
        
    // Offer selection of plots
    const dropdownOptions = [
        {value: 'value', label: 'Most Cited'},
        {value: 'studyNum', label:  'Study ID'},
        {value: 'datePublishedFloat', label: 'Most Recent'}
    ]

    function onSelectChangeOrder(eventKey){
        setPmOrderBy(eventKey)
    }

    return(
        <div id="#most-cited">
            <h2>Most Cited Publications Related to Studies to ImmuneSpace</h2>
            <p><b>For More Information:</b></p>
            <ul>
                <li>Hover over each bar for publication information</li>
                <li>Click on the Y-axis label to go to PubMed page for the publication</li>
                <li>Update the ordering of the publications using the dropdown menu below</li>
            </ul>
            <br></br>
            <Bootstrap.DropdownButton title='Select Order' id='order-select-dropdown'>
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
            <BarPlot
                data={pmPlotData.data} 
                titles={pmPlotData.titles}
                name={pmPlotData.name} 
                height={pmPlotData.height} 
                width={pmPlotData.width} 
                dataRange={pmPlotData.dataRange}
                linkBaseText={pmPlotData.linkBaseText}
            />
        </div>
    )
}