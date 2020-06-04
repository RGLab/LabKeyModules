// Function imports
import * as React from 'react';
import * as LABKEY from '@labkey/api';
import * as Bootstrap from 'react-bootstrap';
import 'regenerator-runtime/runtime';


import {BarPlot,
        BarPlotDatum,
        BarPlotProps,
        BarPlotTitles} from './components/mostCitedBarPlot'
import {ScatterPlot,
        ScatterPlotDatum,
        ScatterPlotProps,
        ScatterPlotDataRange} from './components/similarStudyScatterPlot'
import {MaBarPlot,
        MaLinePlot,
        MaBarPlotDatum,
        MaBarPlotProps,
        MaLinePlotDatum,
        MaLinePlotProps,
        MaPlotTitles,
        } from './components/mostAccessedPlots'

// Styling imports
import './HighlightedReports.scss';
// import 'bootstrap/dist/css/bootstrap.min.css'; // v3

const ResourcesPage: React.FC = () => {
    
    /*  -----------------------------------
            Global State
        ----------------------------------- */

    const [divToShow, setDivToShow] = React.useState<string>("Reports");
    const [plotToShow, setPlotToShow] = React.useState<string>("most-cited")
    const labkeyBaseUrl = LABKEY.ActionURL.getBaseURL()
    const apiBase = labkeyBaseUrl + '_rapi/'

    /*  -----------------------------------
            StudyStats State
        ----------------------------------- */

    // --- Most Cited
    const [pmData, setPmData] = React.useState({}); 
    const [pmHasError, setPmErrors] = React.useState(false);
    const [transformedPmData, setTransformedPmData] = React.useState({
        byPubId: Array<BarPlotDatum>()
    });
    const [pmDataRange, setPmDataRange] = React.useState({
        byPubId: Array<number>()
    });
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
    const [orderBy, setOrderBy] = React.useState("studyNum")

    // --- Similar Studies
    const [ssData, setSsData] = React.useState({}) 
    const [ssTransformedData, setSsTransformedData] = React.useState(
        Array<ScatterPlotDatum>()
    )
    const [ssHasError, setSsErrors] = React.useState(false)
    const [ssDataRange, setSsDataRange] = React.useState<ScatterPlotDataRange>({x: [], y: []})
    const [ssPlotPropsList, setSsPlotPropsList] = React.useState({})
    const [ssPlotsToShow, setSsPlotsToShow] = React.useState("assays")

    // --- Most Accessed
    const [maData, setMaData] = React.useState({
        byStudy: Array<Object>(),
        byMonth: Array<Object>()
    }); 
    const [maHasError, setMaErrors] = React.useState(false);
    const [transformedMaData, setTransformedMaData] = React.useState({
        byStudy: Array<Object>(),
        byMonth: Array<Object>()
    });

    const [maLinePlotProps, setMaLinePlotProps] = React.useState<MaLinePlotProps>()
    const [maBarPlotProps, setMaBarPlotProps] = React.useState<MaBarPlotProps>()
    const [maBarOrderBy, setmaBarOrderBy] = React.useState("total")
    const [maPlotToShow, setMaPlotToShow] = React.useState("study")

    /*  -----------------------------------
            Get StudyStats Data via API
        ----------------------------------- */

    async function fetchCiteData() {
        const res = await fetch(apiBase + 'pubmed_data');
        res
            .json()
            .then(res => setPmData(res))
            .catch(err => setPmErrors(err));
    }

    async function fetchSdyData() {
        const res = await fetch(apiBase + 'sdy_metadata');
        res
            .json()
            .then(res => setSsData(res))
            .catch(err => setSsErrors(err));
    }

    async function fetchLogData() {
        const res = await fetch(apiBase + 'log_data');
        res
            .json()
            .then(res => setMaData(res))
            .catch(err => setMaErrors(err));
    }

    React.useEffect(() => {
        fetchCiteData();
        fetchSdyData();
        fetchLogData();
    }, []); // empty array as second arg to useEffect means only loaded on mount, not update

     /*  -----------------------------------
            StudyStats Transformations
        ----------------------------------- */

    // --- Helpers
    function getRangeFromIntArray(objectArray, elementName){
        const values = objectArray.map(a => parseFloat(a[elementName]))
        const max = Math.max(...values)
        const min = Math.min(...values)
        return([min, max])
    }

    function convertDatePublishedToFloat(date: string){
        let dateSplit = date.split("-")
        let months = dateSplit[1] == '1' || dateSplit[1] == 'NA' ? 0 : (parseInt(dateSplit[1]) - 1) / 12
        let monthsStr = months.toString().split('.')[1]
        let newDate = dateSplit[0] + "." + monthsStr
        return(parseFloat(newDate))
    }

    function convertDateToPercent(date: number, dateRange: number[]){
        return( (date - dateRange[0]) / (dateRange[1] - dateRange[0]) )
    }

    // --- Main
    function transformCiteData(){
        const tmpPlotData = {
            // byStudy: [],
            byPubId: []
        };
        if(Object.keys(pmData).length !== 0){
            Object.keys(pmData).forEach(function(key){
                let datum: BarPlotDatum =
                {
                    label: pmData[key].study + ": " + key,
                    value: parseInt(pmData[key].citations),
                    hoverOverText: pmData[key].title + " // " + pmData[key].datePublished,
                    datePublishedStr: pmData[key].datePublished.toString(),
                    datePublishedFloat: convertDatePublishedToFloat(pmData[key].datePublished.toString()),
                    studyNum: parseInt(pmData[key].studyNum),
                    datePublishedPercent: null
                }
                tmpPlotData.byPubId.push(datum)
                // tmp.byStudy.push(
                //     {
                //         value: pmData[key].Citations,
                //         label: pmData[key].study + ": " + pmData[key].original_id,
                //         hoverOver: "http://www.ncbi.nlm.nih.gov/pubmed?linkname=pubmed_pubmed_citedin&from_uid=" + pmData[key].original_id
                //     }
                // )
            })
            
            let tmpRangeData = {byPubId: Array<number>()}
            tmpRangeData['byPubId'] = getRangeFromIntArray(tmpPlotData.byPubId, "value")
            setPmDataRange(tmpRangeData)

            let tmpRangeDates = getRangeFromIntArray(tmpPlotData.byPubId, "datePublishedFloat")

            tmpPlotData.byPubId = tmpPlotData.byPubId.map(function(el){
                el.datePublishedPercent = convertDateToPercent(el.datePublishedFloat, tmpRangeDates)
                return(el)
            })

            setTransformedPmData(tmpPlotData);
        }
    }
    
    React.useEffect(() => {
        transformCiteData();
    }, [pmData])

    function transformSdyMetaData(){
        const data = []
        if(Object.keys(ssData).length !== 0){
            Object.keys(ssData).forEach(function(key){
                let datum: ScatterPlotDatum = 
                {
                    assays: {
                        elisa: parseInt(ssData[key].has_elisa[0]),
                        elispot: parseInt(ssData[key].has_elispot[0]),
                        hai: parseInt(ssData[key].has_hai[0]),
                        neutralizingAntibodyTiter: parseInt(ssData[key].has_neut_ab_titer[0]),
                        geneExpression: parseInt(ssData[key].has_gene_expression[0]),
                        flowCytometry: parseInt(ssData[key].has_fcs[0]),
                        pcr: parseInt(ssData[key].has_pcr[0]),
                        mbaa: parseInt(ssData[key].has_mbaa[0])
                    },
                    studyDesign: {
                        maximumAge: parseInt(ssData[key].newMaxAge[0]),
                        minimumAge: parseInt(ssData[key].newMinAge[0]),
                        numberOfParticipants: parseInt(ssData[key].actual_enrollment[0]),
                        clinicalTrial: parseInt(ssData[key].clinical_trial[0])
                    },
                    condition: {
                        dengue: parseInt(ssData[key].Dengue[0]),
                        dermatomyositis: parseInt(ssData[key].Dermatomyositis[0]),
                        ebola: parseInt(ssData[key].Ebola[0]),
                        healthy: parseInt(ssData[key].Healthy[0]),
                        hepatitis: parseInt(ssData[key].Hepatitis[0]),
                        hiv: parseInt(ssData[key].HIV[0]),
                        influenza: parseInt(ssData[key].Influenza[0]),
                        malaria: parseInt(ssData[key].Malaria[0]),
                        meningitis: parseInt(ssData[key].Meningitis[0]),
                        smallpox: parseInt(ssData[key].Smallpox[0]),
                        tuberculosis: parseInt(ssData[key].Tuberculosis[0]),
                        unknown: parseInt(ssData[key].Unknown[0]),
                        varicellaZoster: parseInt(ssData[key].Varicella_Zoster[0]),
                        westNile: parseInt(ssData[key].West_Nile[0]),
                        yellowFever: parseInt(ssData[key].Yellow_Fever[0]),
                        zika: parseInt(ssData[key].Zika[0]),
                        cmv: parseInt(ssData[key].CMV[0])
                    },
                    x: parseFloat(ssData[key].x[0]),
                    y: parseFloat(ssData[key].y[0]),
                    study: ssData[key].study[0]
                }
                data.push(datum)
            })
            setSsTransformedData(data)

            const MULTIPLIER = 1.1
            var xRange = getRangeFromIntArray(data, "x")
            var yRange = getRangeFromIntArray(data, "y")
            xRange = [ xRange[0] * MULTIPLIER, xRange[1] * MULTIPLIER]
            yRange = [ yRange[0] * MULTIPLIER, yRange[1] * MULTIPLIER]
            const tmpDataRanges = {x: xRange, y: yRange}
            setSsDataRange(tmpDataRanges)
        }
    }

    React.useEffect(() => {
        transformSdyMetaData();
    }, [ssData])

    function transformLogData(){
        const data = {
            byStudy: [],
            byMonth: []
        }
        if(Object.keys(maData.byStudy).length !== 0){

            Object.keys(maData.byStudy).forEach(function(key){
                let datum = 
                {
                    ISR: parseInt(maData.byStudy[key].ISR[0]),
                    UI: parseInt(maData.byStudy[key].UI[0]),
                    total: parseInt(maData.byStudy[key].total[0]),
                    study: "SDY" + maData.byStudy[key].studyId[0]
                }
                data.byStudy.push(datum)
            })

            Object.keys(maData.byMonth).forEach(function(key){
                let datum = 
                {
                    ISR: parseInt(maData.byMonth[key].ISR[0]),
                    UI: parseInt(maData.byMonth[key].UI[0]),
                    total: parseInt(maData.byMonth[key].total[0]),
                    date: maData.byMonth[key].Month[0]
                }
                data.byMonth.push(datum)
            })

            setTransformedMaData(data)
            
        }
    }

    React.useEffect(() => {
        transformLogData();
    }, [maData])


    /*  -----------------------------------
            StudyStats Set Plot Data
        ----------------------------------- */

    // --- MostCited ----
    React.useEffect(() => {
        transformedPmData.byPubId.sort((a,b) => (a[orderBy] > b[orderBy]) ? 1 : -1)

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
    }, [transformedPmData, pmDataRange, orderBy])


    // --- SimilarStudies ---

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
            ssTransformedData.sort((a,b) => 
                (a[dataType][label] > b[dataType][label]) ? 1 : -1
            )

            // deep copy to ensure sort stays put
            const sortedData = JSON.parse(JSON.stringify(ssTransformedData))

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

    }, [ssTransformedData, ssDataRange])  

    // --- MostAccessed ----
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

        // let UIlayer: MaLinePlotLayer = {
        //     name: 'UI',
        //     values: []
        // }
        // let ISRlayer: MaLinePlotLayer = {
        //     name: 'ISR',
        //     values: []
        // }
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

    // --------- REPORTS -----------------
    // Define Components in list - one for each report (img, title, text)
    const Reports: React.FC = () => {
        // Define baseUrl 
        var baseUrl = window.location.origin;

        // Define path to image resources
        // Actual path in directory is ResourcesPage/resources/web/ResourcesPage/images
        var imgPath = '/ResourcesPage/images/'

        var data = [
            {
                study: 'SDY144',
                link: '/reports/Studies/SDY144/runReport.view?reportId=module%3ASDY144%2Freports%2Fschemas%2Fstudy%2Fdemographics%2FHAI_VN_vs_plasma_cells.Rmd',
                img: 'SDY144_report_thumbnail.png',
                title: 'Correlation of HAI/VN and plasma cell counts',
                text: 'Reproduction of Figure 2 of Cao RG et al, "Differences in antibody responses between trivalent inactivated influenza vaccine and live attenuated influenza vaccine correlate with the kinetics and magnitude of interferon signaling in children." J Infect Dis 210(2), 2014 Jul 15.'
            },
            {
                study: 'SDY180',
                link: '/reports/Studies/SDY180/runReport.view?reportId=module%3ASDY180%2Freports%2Fschemas%2Fstudy%2Fdemographics%2Fplasmablast_abundance.Rmd',
                img: 'SDY180_report_thumbnail.png',
                title: 'Measuring plasmablast abundance by multi-parameter flow cytometry',
                text: 'This report investigates the abundance of plasmablast (and other B cell subsets) over time after vaccination with Pneumovax, Fluzone, or no vaccination (saline control group). The results are similar to those reported in Figure 6 B of Obermoser et al. (2013).'
            },
            {
                study: 'SDY207',
                link: '/project/Studies/SDY207/begin.view?pageId=Reports',
                img: 'SDY207_report_thumbnail.png',
                title: 'Multiple custom reports related to CyTOF and Flow Cytometry Data',
                text: 'These reports take advantage of a rich cytometry dataset to do things like compare power analyses using manual and automated gating.'
            },
            {
                study: 'SDY269',
                link: '/reports/Studies/SDY269/runReport.view?reportId=module%3ASDY269%2Freports%2Fschemas%2Fhai_flow_elispot.Rmd',
                img: 'SDY269_report_thumbnail.png',
                title: 'Correlating HAI with flow cytometry and ELISPOT results',
                text: 'This report investigates the association between the number influenza-specific cells measured by ELISPOT measured at day 7 with the number of plasmablast measured by flow cytometry at day 7 and the HAI response measured at day 28 (log-fold day28/day0). It reproduces Figure 1 (d-e) of Nakaya et al. (2011)'
            },
            {
                study: 'ImmuneSignatures 1',
                link: 'project/HIPC/IS1/begin.view?pageId=Report',
                img: 'IS1_report_thumbnail.png',
                title: 'Influenza Vaccine Meta-Analysis to define genetic predictors of vaccine response',
                text: 'Reproduction of figures from HIPC-CHI Signatures Project Team, "Multicohort analysis reveals baseline transcriptional predictors of influenza vaccination responses." Science Immunology 25 Aug 2017: Vol. 2, Issue 14.'
            },
            {
                study: 'Lyoplate',
                link: 'project/HIPC/Lyoplate/begin.view?pageId=Analyses',
                img: 'Lyoplate_report_thumbnail.png',
                title: 'Standardizing Flow Cytometry Immunophenotyping from Reagents to Analyses:  Results of the Human ImmunoPhenotyping Consortium',
                text: 'Standardization of flow cytometry assays requires careful attention to reagents, sample handling, instrument setup, and data analysis, and is essential for successful cross-study and cross-center performance and analysis of large data sets. Analyses from HIP-C attempt to determine whether automated methods were a suitable approach to streamline and further standardize analysis'
            }
        ]
        
        // React requires each list element have a unique key for DOM.
        // However this key is NOT shown in the inspector.
        const reportsList = data.map(function(report){
            var fullUrl = baseUrl + report.link
            return(
                <tr key={report.study}>
                    <td className="hr-imgCol">
                        <img className="hr-staticImg" src={imgPath + report.img}/>
                    </td>
                    <td className="hr-infoCol">
                        <h2>{report.study}</h2>
                        <a href={fullUrl}>{report.title}</a>
                        <p>{report.text}</p>
                    </td>
                </tr>
            )
        })

        return(
            <div id="Reports">
                <table>
                    <tbody>
                        {reportsList}
                    </tbody>
                </table>
            </div>
            
        )
    }

    // --------- DataStandards -------------
    const DataStandards: React.FC = () => { 

        const Cytometry: React.FC = () => {
            return(
                <div>
                    <p>
                        Under Construction
                    </p>
                </div>
            )
        }

        const GeneExpression: React.FC = () => {
            return(
                <div>
                   <img src="/ResourcesPage/images/ge_standardization.png"
                        padding-top="80%"
                        width="65%"/>
                </div>
            )
        }

        const ImmuneResponse: React.FC = () => {
            return(
                <div>
                    <p>
                        Under Construction
                    </p>
                </div>
            )
        }

        return(
            <div id="DataStandards">
                { plotToShow == "cytometry" ? <Cytometry/> : null}
                { plotToShow == "gene-expression" ? <GeneExpression/> : null}
                { plotToShow == "immune-response" ? <ImmuneResponse/> : null}
            </div>
        )
    }

    // --------- StudyStats -----------------
    const StudyStats: React.FC = () => { 

        const MostCited: React.FC = () => {
            
            // Offer selection of plots
            const dropdownOptions = [
                {value: 'value', label: 'Most Cited'},
                {value: 'studyNum', label:  'Study ID'},
                {value: 'datePublishedFloat', label: 'Most Recent'}
            ]

            function onSelectChangeOrder(eventKey){
                setOrderBy(eventKey)
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
       
        const MostAccessed: React.FC = () => {
             // Offer selection of plots
            const dropdownOptions = [
                {value: 'study', label: 'By Study'},
                {value: 'month', label:  'By Month'},
            ]

            function onSelectChangePlot(eventKey){
                setMaPlotToShow(eventKey)
            }

            const barDropdownOptions = [
                {value: 'UI', label: 'UI Pageviews'},
                {value: 'ISR', label:  'ImmuneSpaceR connections'},
                {value: 'total', label: 'All interactions'}
            ]

            function onSelectChangeBarOrder(eventKey){
                setmaBarOrderBy(eventKey)
            }

            const BarOrderDropdown: React.FC = () => {
                return(
                    <Bootstrap.DropdownButton title='Select Order' id='ma-bar-order-select-dropdown'>
                        <Bootstrap.MenuItem 
                            eventKey={barDropdownOptions[0].value} 
                            onSelect={onSelectChangeBarOrder}>
                            {barDropdownOptions[0].label}
                        </Bootstrap.MenuItem>
                        <Bootstrap.MenuItem 
                            eventKey={barDropdownOptions[1].value} 
                            onSelect={onSelectChangeBarOrder}>
                            {barDropdownOptions[1].label}
                        </Bootstrap.MenuItem>
                        <Bootstrap.MenuItem 
                            eventKey={barDropdownOptions[2].value} 
                            onSelect={onSelectChangeBarOrder}>
                            {barDropdownOptions[2].label}
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
                                    <Bootstrap.MenuItem eventKey={dropdownOptions[0].value} onSelect={onSelectChangePlot}>
                                        {dropdownOptions[0].label}
                                    </Bootstrap.MenuItem>
                                    <Bootstrap.MenuItem eventKey={dropdownOptions[1].value} onSelect={onSelectChangePlot}>
                                        {dropdownOptions[1].label}
                                    </Bootstrap.MenuItem>
                                </Bootstrap.DropdownButton>
                            </td>
                            <td>
                                { maPlotToShow == "study" ? <BarOrderDropdown/> : null}
                            </td>
                        </tr>
                    </table>
                    <div id="maPlot">
                        <MaPlot/>
                    </div>
                </div>
            )
        }

        const SimilarStudies: React.FC = () => {
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

        return(
            <div id="StudyStats">
                { plotToShow == "most-cited" ? <MostCited/> : null}
                { plotToShow == "most-accessed" ? <MostAccessed/> : null}
                { plotToShow == "similar-studies" ? <SimilarStudies/> : null}
            </div>
        )
    }

    // --------- NAVBAR -----------------
    // Use bootstrap in Navbar
    const Navbar: React.FC = () => { 
        
        const divInfo = [
            {
                id: "reports",
                tag: "Reports",
                text: "Highlighted Reports"
            },
            {
                id: "study-stats",
                tag: "StudyStats",
                text: "Study Statistics",
                subMenu: [
                    {
                        tag: "most-accessed",
                        text: "Most Accessed"
                    },
                    {
                        tag: "most-cited",
                        text: "Most Cited"
                    },
                    {
                        tag: "similar-studies",
                        text: "Similar Studies"
                    }
                ]
            },
            {
                id: "data-standards",
                tag: "DataStandards",
                text: "Data Standards",
                subMenu: [
                    {
                        tag: "cytometry",
                        text: "Cytometry"
                    },
                    {
                        tag: "gene-expression",
                        text: "Gene Expression"
                    },
                    {
                        tag: "immune-response",
                        text: "Immune Response"
                    }
                ]
            }
        ]

       
        const navBarElements = divInfo.map(function(el){
            const itemId = "navbar-link-" + el.id;
            const href = "#" + el.tag;
    
            if(["DataStandards", "StudyStats"].indexOf(el.tag) !== -1){
                var className = "nav-item dropdown" + (divToShow == el.tag ? " active" : "");
                const dropDownId = el.tag + "Dropdown"

                const subMenuHtml = el.subMenu.map(function(subel, i){
                    const tag = "#" + subel.tag
                    return(
                        <li>
                            <a  key={i} 
                                id={subel.tag} 
                                href={tag} 
                                onClick={function(){
                                    setDivToShow(el.tag)
                                    setPlotToShow(subel.tag)
                                }}>
                                {subel.text}
                            </a>
                        </li>
                    )
                })

                return(
                    <li id={itemId} className={className}>
                        <a  className="dropdown-toggle" 
                            href={href} 
                            id={dropDownId} 
                            role="button" 
                            data-toggle="dropdown" 
                            aria-haspopup="true" 
                            aria-expanded="false"
                            onClick={function(){
                                const parentNode = document.getElementById(itemId)
                                if(parentNode.className == "nav-item dropdown active"){
                                    parentNode.className = "nav-item dropdown active open"
                                }else if(parentNode.className == "nav-item dropdown active open"){
                                    parentNode.className = "nav-item dropdown active"
                                }
                            }}>
                            {el.text} <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            {subMenuHtml}
                        </ul>
                        
                    </li>
                )
            }else{
                const className = divToShow == el.tag ? " active" : "";
                return(
                    <li id = {itemId} className = {className}>
                        <a href = {href} onClick={() => setDivToShow(el.tag)}>
                            {el.text}
                        </a>
                    </li>
                )
            }
        })

        return(
            <nav className="navbar navbar-default" style={{backgroundColor: 'white'}} >
                <div className="container-fluid">
                    <ul className="nav navbar-nav">
                        {navBarElements}
                    </ul>
                </div>
            </nav>
        )
    }

    // return
    return(
        <div>
            <Navbar/>
            { divToShow == "DataStandards" ? <DataStandards/> : null}
            { divToShow == "Reports" ? <Reports/> : null}
            { divToShow == "StudyStats" ? <StudyStats/> : null}
        </div>
    )
}





// --------- EXPORT ------------
// There should be a single export: a component called "App"
export const App: React.FC = () => {

    const filterBanner = document.getElementById('filter-banner')
    filterBanner.style.display = 'none'

    // Must return a React Fragment
    return <ResourcesPage/>
}
