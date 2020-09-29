import * as React from "react";
import {MenuItem, DropdownButton, Tab, TabPane, TabContainer} from "react-bootstrap";
import { 
    MaBarPlot,
    MaBarPlotProps,
    MaLinePlot,
    MaLinePlotProps,
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
    const [maLinePlotProps, setMaLinePlotProps] = React.useState<MaLinePlotProps>()
    const [maBarPlotProps, setMaBarPlotProps] = React.useState<MaBarPlotProps>()

    React.useEffect(() => {
        createLinePlotProps(transformedMaData.byMonth, setMaLinePlotProps)
    }, [transformedMaData])

    React.useEffect(() => {
        createBarPlotProps(transformedMaData.byStudy, maBarOrderBy, labkeyBaseUrl, setMaBarPlotProps)
        
    }, [transformedMaData, maBarOrderBy])

    function onSelectChangeBarOrder(eventKey){
        setMaBarOrderBy(eventKey)
    }

    const barDropdown = React.useCallback( (orderOptions, onSelect) => {
        return(
            <div>
                <DropdownButton title='Select Order' id='ma-bar-order-select-dropdown'>
                    <MenuItem 
                        eventKey={orderOptions[0].value} 
                        onSelect={onSelect}>
                        {orderOptions[0].label}
                    </MenuItem>
                    <MenuItem 
                        eventKey={orderOptions[1].value} 
                        onSelect={onSelect}>
                        {orderOptions[1].label}
                    </MenuItem>
                    <MenuItem 
                        eventKey={orderOptions[2].value} 
                        onSelect={onSelect}>
                        {orderOptions[2].label}
                    </MenuItem>
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

    function onSelectChangePlot(eventKey){
        setPlotToShow(eventKey)
    }

    const getMainDropDown = React.useCallback(() => {
        return(
            <table>
                <tbody>
                    <tr>
                        <td>
                            <DropdownButton title='Select Plot Type' id='ma-type-select-dropdown'>
                                <MenuItem eventKey={PLOT_OPTIONS[0].value} key={PLOT_OPTIONS[0].value} onSelect={onSelectChangePlot}>
                                    {PLOT_OPTIONS[0].label}
                                </MenuItem>
                                <MenuItem eventKey={PLOT_OPTIONS[1].value} key={PLOT_OPTIONS[1].value} onSelect={onSelectChangePlot}>
                                    {PLOT_OPTIONS[1].label}
                                </MenuItem>
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

    const getTabContent = React.useCallback(() => {
        if(typeof(maBarPlotProps) !== "undefined" && typeof(maLinePlotProps) !== "undefined"){
            return(
                <Tab.Content>
                    <TabPane eventKey={PLOT_OPTIONS[0].value}>
                        <PlotTab
                            optionSelection={PLOT_OPTIONS[0].value}
                            props={maBarPlotProps}
                            Component={MaBarPlot}
                        />
                    </TabPane>
                    <TabPane eventKey={PLOT_OPTIONS[1].value}>
                        <PlotTab
                            optionSelection={PLOT_OPTIONS[1].value}
                            props={maLinePlotProps}
                            Component={MaLinePlot}
                        />
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
        
    }, [maBarPlotProps, maLinePlotProps])

    return(
        <TabContainer defaultActiveKey={plotToShow} generateChildId={generateChildId}>
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