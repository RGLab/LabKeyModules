import * as React from "react";
import * as Bootstrap from 'react-bootstrap'
import { 
    MaBarPlot,
    MaBarPlotDatum,
    MaBarPlotProps,
    MaLinePlot,
    MaLinePlotDatum,
    MaLinePlotProps,
    MaPlotTitles
} from './components/mostAccessedPlots'



export const MostAccessed = (transformedMaData, labkeyBaseUrl) => {

    const [maBarOrderBy, setMaBarOrderBy] = React.useState("total")
    const [maPlotToShow, setMaPlotToShow] = React.useState("study")

    // --- Most Accessed
    const [maLinePlotProps, setMaLinePlotProps] = React.useState<MaLinePlotProps>()
    const [maBarPlotProps, setMaBarPlotProps] = React.useState<MaBarPlotProps>()

    React.useEffect(() => {
        
        // Remove zero values to avoid odd looking chart since sorting is done
        // using a quicksort that leaves secondary sort in groups
        const tmp = JSON.parse(JSON.stringify(transformedMaData.byStudy))
        var tmpStudyData = tmp.filter(el => el[maBarOrderBy] > 10)
        tmpStudyData.sort((a,b) => (a[maBarOrderBy] > b[maBarOrderBy]) ? 1 : -1)
    
        // logic for updating titles
        const barTitles: MaPlotTitles = {
            x: 'Number of User Interactions',
            y: 'Study Id',
            main: 'ImmuneSpace Usage by ImmuneSpaceR API and UI'
        }
    
        const barData = []
        const barLabels = []
        tmpStudyData.forEach(element => {
            let datum: MaBarPlotDatum = {
                UI: element['UI'],
                ISR: element['ISR'],
                total: element['total'] 
            }
            barData.push(datum)
            barLabels.push(element['study'])
        })
    
        // logic for updating props
        let barProps: MaBarPlotProps = {
            data: barData,
            labels: barLabels,
            titles: barTitles,
            name: "byStudy",
            width: 700,
            height: 800,
            linkBaseText: labkeyBaseUrl + '/project/Studies/'
        }
        
        setMaBarPlotProps(barProps)
    
        // logic for updating titles
        const lineTitles: MaPlotTitles = {
            x: 'Date',
            y: 'Number of User Interactions',
            main: 'ImmuneSpace Usage over Time'
        }
    
        const lineData = []
        const lineLabels = []
        transformedMaData.byMonth.forEach(element => {
            let datum: MaLinePlotDatum = {
                UI: element['UI'],
                ISR: element['ISR'],
                total: element['total'] 
            }
            lineData.push(datum)
            lineLabels.push(element['date'])
        })
    
        // logic for updating props
        let lineProps: MaLinePlotProps = {
            data: lineData,
            titles: lineTitles,
            labels: lineLabels,
            name: "byMonth",
            width: 1100,
            height: 600,
            linkBaseText: 'test month'
        }
        
        setMaLinePlotProps(lineProps)
        
    }, [transformedMaData, maBarOrderBy])

    const plotOptions = [
        {value: 'study', label: 'By Study'},
        {value: 'month', label:  'By Month'},
    ]

    const byStudyOrderOptions = [
        {value: 'UI', label: 'UI Pageviews'},
        {value: 'ISR', label:  'ImmuneSpaceR connections'},
        {value: 'total', label: 'All interactions'}
    ]

    function onSelectChangeBarOrder(eventKey){
        setMaBarOrderBy(eventKey)
    }

    const ByStudyDropdown: React.FC = () => {
        return(
            <Bootstrap.DropdownButton title='Select Order' id='ma-bar-order-select-dropdown'>
                <Bootstrap.MenuItem 
                    eventKey={byStudyOrderOptions[0].value} 
                    onSelect={onSelectChangeBarOrder}>
                    {byStudyOrderOptions[0].label}
                </Bootstrap.MenuItem>
                <Bootstrap.MenuItem 
                    eventKey={byStudyOrderOptions[1].value} 
                    onSelect={onSelectChangeBarOrder}>
                    {byStudyOrderOptions[1].label}
                </Bootstrap.MenuItem>
                <Bootstrap.MenuItem 
                    eventKey={byStudyOrderOptions[2].value} 
                    onSelect={onSelectChangeBarOrder}>
                    {byStudyOrderOptions[2].label}
                </Bootstrap.MenuItem>
            </Bootstrap.DropdownButton>
        )
    }

    const ByStudyAddlInfo: React.FC = () => {
        if(maPlotToShow == "study"){
            return(
                <ul>
                    <li>Hover over each bar for specific study data</li>
                    <li>Click on the Y-axis label to go to study overview page</li>
                    <li>Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"</li>
                </ul>
                
            )
        }else{
            return(
                <ul>
                    <li>Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"</li>
                </ul>
                
            )
        }
    }

    const MaPlot: React.FC = () => {
        if(maPlotToShow == "study"){
            return(
                <MaBarPlot
                    data={maBarPlotProps.data}
                    labels={maBarPlotProps.labels}
                    titles={maBarPlotProps.titles}
                    name={maBarPlotProps.name}
                    width={maBarPlotProps.width}
                    height={maBarPlotProps.height}
                    linkBaseText={maBarPlotProps.linkBaseText}
                />
            )
        }else{
            return(
                <MaLinePlot
                    data={maLinePlotProps.data}
                    labels={maLinePlotProps.labels}
                    titles={maLinePlotProps.titles}
                    name={maLinePlotProps.name}
                    width={maLinePlotProps.width}
                    height={maLinePlotProps.height}
                    linkBaseText={maLinePlotProps.linkBaseText}
                />
            )
        }
    }

    return(
        <div id="#most-accessed">
            <h2>ImmuneSpace Usage Over Time or By Study</h2>
            <p>The plots below allow you to view ImmuneSpace usage since the launch of the platform in 2016</p>
            <p><b>For More Information:</b></p>
            <ByStudyAddlInfo/>
            <br></br>
            <table>
                <tr>
                    <td>
                        <Bootstrap.DropdownButton title='Select Plot Type' id='ma-type-select-dropdown'>
                            <Bootstrap.MenuItem eventKey={plotOptions[0].value} onSelect={onSelectChangePlot}>
                                {plotOptions[0].label}
                            </Bootstrap.MenuItem>
                            <Bootstrap.MenuItem eventKey={plotOptions[1].value} onSelect={onSelectChangePlot}>
                                {plotOptions[1].label}
                            </Bootstrap.MenuItem>
                        </Bootstrap.DropdownButton>
                    </td>
                    <td>
                        { maPlotToShow == "study" ? <ByStudyDropdown/> : null}
                    </td>
                </tr>
            </table>
            <div id="maPlot">
                <MaPlot/>
            </div>
        </div>
    )
}