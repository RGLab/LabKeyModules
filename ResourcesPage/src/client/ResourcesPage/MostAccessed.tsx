import * as React from "react";
import {
    MenuItem, 
    DropdownButton, 
    Tab, 
    TabPane, 
    TabContainer
} from "react-bootstrap";
import { 
    MaBarPlot,
    MaLinePlot,
} from './PlotComponents/mostAccessedPlots'
import {
    createBarPlotProps, 
    createLinePlotProps,
} from './MostAccessed/utils'
import {
    PLOT_OPTIONS, 
    BY_STUDY_ORDER_OPTIONS,
    AddlInfoLine,
    AddlInfoBar
} from './MostAccessed/constants'

interface props {
    transformedMaData: {
        byStudy: Object[],
        byMonth: Object[]
    };
    labkeyBaseUrl: string;
}

export const MostAccessed = React.memo<props>(( {transformedMaData, labkeyBaseUrl}: props ) => {

    const [plotToShow, setPlotToShow] = React.useState(PLOT_OPTIONS[0].value)
    const [maBarOrderBy, setMaBarOrderBy] = React.useState(BY_STUDY_ORDER_OPTIONS[2].value)

    function onSelectChangeBarOrder(eventKey){
        setMaBarOrderBy(eventKey)
    }

    const makeBarMenuItem = React.useCallback((selection, onSelect) => {
        return(
            <MenuItem 
                eventKey={selection.value} 
                onSelect={onSelect}>
                    {selection.label}
            </MenuItem>
        )
    }, [])

    const barDropdown = React.useCallback( (orderOptions, onSelect) => {
        return(
            <div>
                <DropdownButton title='Select Order' id='ma-bar-order-select-dropdown'>
                    {makeBarMenuItem(orderOptions[0], onSelect)}
                    {makeBarMenuItem(orderOptions[1], onSelect)}
                    {makeBarMenuItem(orderOptions[2], onSelect)}
                </DropdownButton>
            </div>
        )
    }, [])

    const getPlot = React.useCallback((props, Component) => {
        return(
            <Component
                data={props.data}
                labels={props.labels}
                titles={props.titles}
                name={props.name}
                width={props.width}
                height={props.height}
                linkBaseText={props.linkBaseText}
            />
        )
    }, [])

    const makeMainMenuItem = React.useCallback((selection) => {
        function onSelectChangePlot(eventKey){
            console.log(eventKey)
            setPlotToShow(eventKey)
        }

        return(
            <MenuItem 
                eventKey={selection.value} 
                key={selection.value} 
                onSelect={onSelectChangePlot}>
                    {selection.label}
            </MenuItem>
        )
    }, [])

    const getMainDropDown = React.useCallback(() => {
        return(
            <table>
                <tbody>
                    <tr>
                        <td>
                            <DropdownButton title='Select Plot Type' id='ma-type-select-dropdown'>
                                {makeMainMenuItem(PLOT_OPTIONS[0])}
                                {makeMainMenuItem(PLOT_OPTIONS[1])}
                            </DropdownButton>
                        </td>
                        <td>
                            {plotToShow == PLOT_OPTIONS[0].value ? barDropdown(BY_STUDY_ORDER_OPTIONS, onSelectChangeBarOrder) : null}
                        </td>
                    </tr>
                </tbody>
            </table>
        ) 
    }, [plotToShow])

    const generateChildId = React.useCallback((eventKey: any, type: any) => {
        return eventKey;
    }, []);

    interface plotTabProps {
        optionSelection: string;
        props: Object;
        Component: React.FC;
    }

    const PlotTab = React.memo<plotTabProps>(( {optionSelection, props, Component} : plotTabProps) => {
        return(
            <div>
                {optionSelection == PLOT_OPTIONS[0].value ? <AddlInfoBar/> : <AddlInfoLine/>}
                {getPlot(props, Component)}
            </div>
        )
    });

    const makeTabPane = React.useCallback((selection, plotProps, plotComponent) => {
        return(
            <TabPane eventKey={selection.value}>
                <PlotTab
                    optionSelection={selection.value}
                    props={plotProps}
                    Component={plotComponent}
                />
            </TabPane>
        )
    }, [transformedMaData, maBarOrderBy])

    const getTabContent = React.useCallback(() => {
        if(transformedMaData.byMonth.length > 0 && transformedMaData.byStudy.length > 0){
            let maLinePlotProps = createLinePlotProps(transformedMaData.byMonth)
            let maBarPlotProps = createBarPlotProps(transformedMaData.byStudy, maBarOrderBy, labkeyBaseUrl)
            return(
                <Tab.Content>
                    {makeTabPane(PLOT_OPTIONS[0], maBarPlotProps, MaBarPlot)}
                    {makeTabPane(PLOT_OPTIONS[1], maLinePlotProps, MaLinePlot)}
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
        
    }, [transformedMaData, maBarOrderBy])

    return(
        <TabContainer activeKey={plotToShow} generateChildId={generateChildId}>
            <div>
                <h2>ImmuneSpace Usage Over Time or By Study</h2>
                <p>The plots below allow you to view ImmuneSpace usage since the launch of the platform in 2016</p>
                <p><b>For More Information:</b></p>
                {getMainDropDown()}
                <br></br>
                {getTabContent()}
            </div>   
        </TabContainer>
    )
});