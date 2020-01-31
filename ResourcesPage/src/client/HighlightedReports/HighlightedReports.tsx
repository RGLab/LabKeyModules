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
        MaPlotDatum,
        MaPlotProps,
        MaPlotTitles,
        } from './components/mostAccessedPlots'

// Styling imports
import './HighlightedReports.scss';
// import 'bootstrap/dist/css/bootstrap.min.css'; // v3

const ResourcesPage: React.FC = () => {
    
    /*  -----------------------------------
            Global State
        ----------------------------------- */

    const [divToShow, setDivToShow] = React.useState<string>("About");
    const [plotToShow, setPlotToShow] = React.useState<string>("most-cited")
    const apiBase = LABKEY.ActionURL.getBaseURL() + '_rapi/'

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
    const [maDataRange, setMaDataRange] = React.useState({
        byStudy: Array<number>(),
        byMonth: Array<number>()
    });

    const [maLinePlotProps, setMaLinePlotProps] = React.useState<MaPlotProps>()
    const [maBarPlotProps, setMaBarPlotProps] = React.useState<MaPlotProps>()
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
                        elisa: parseInt(ssData[key].elisa[0]),
                        elispot: parseInt(ssData[key].elispot[0]),
                        hai: parseInt(ssData[key].hai[0]),
                        neutralizingAntibodyTiter: parseInt(ssData[key].neut_ab_titer[0]),
                        geneExpression: parseInt(ssData[key].gene_expression[0]),
                        flowCytometry: parseInt(ssData[key].fcs[0]),
                        pcr: parseInt(ssData[key].pcr),
                        mbaa: parseInt(ssData[key].mbaa)
                    },
                    studyDesign: {
                        author: ssData[key].person_accession[0],
                        sponsor: ssData[key].sponsoring_organization[0],
                        maximumAge: parseInt(ssData[key].newMaxAge[0]),
                        minimumAge: parseInt(ssData[key].newMinAge[0]),
                        numberOfParticipants: parseInt(ssData[key].actual_enrollment[0]),
                        clinicalTrial: ssData[key].clinical_trial[0],
                        initialDataReleaseDate: new Date(ssData[key].initial_data_release_date[0])
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
        const labels = {
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
            
            const byMonthRange = getRangeFromIntArray(data.byMonth, 'total')
            const byStudyRange = getRangeFromIntArray(data.byStudy, 'total')
            setMaDataRange({byMonth: byMonthRange, byStudy: byStudyRange})
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
            width: 700,
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
            // 'author',
            'sponsor',
            'minimumAge',
            'maximumAge',
            'numberOfParticipants',
            'clinicalTrial'
            // 'initialDataReleaseDate'
        ]
    }

    const categoricalLabels = labels.assays
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
            // are plotted last to be visually on top
            ssTransformedData.sort((a,b) => 
                (a[dataType][label] < b[dataType][label]) ? 1 : -1
            )

            // deep copy to ensure sort stays put
            const sortedData = JSON.parse(JSON.stringify(ssTransformedData))

            let plotProps: ScatterPlotProps = {
                data: sortedData,
                name: label,
                width: 300,
                height: 300,
                dataRange: ssDataRange,
                linkBaseText: apiBase + "/project/Studies/",
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
            console.log(element)
            let datum: MaPlotDatum = {
                UI: element['UI'],
                ISR: element['ISR'],
                total: element['total'] 
            }
            barData.push(datum)
            barLabels.push(element['study'])
        });

        // logic for updating props
        let barProps: MaPlotProps = {
            data: barData,
            labels: barLabels,
            titles: barTitles,
            name: "byStudy",
            width: 700,
            height: 800,
            dataRange: maDataRange.byStudy,
            linkBaseText: 'test study'
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
            let datum: MaPlotDatum = {
                UI: element['UI'],
                ISR: element['ISR'],
                total: element['total'] 
            }
            lineData.push(datum)
            lineLabels.push(element['date'])
        });

        // logic for updating props
        let lineProps: MaPlotProps = {
            data: lineData,
            labels: lineLabels,
            titles: lineTitles,
            name: "byMonth",
            width: 700,
            height: 800,
            dataRange: maDataRange.byMonth,
            linkBaseText: 'test month'
        }
        
        setMaLinePlotProps(lineProps)
        
    }, [transformedMaData, maDataRange, maBarOrderBy])


    // --------- ABOUT -----------------
    const About: React.FC = () => { 
        return(
            <div id="About">
                <p><strong>ImmuneSpace provides multiple ways to interact with, visualize and analyze data</strong>. A set of standardized modules &ndash; available under the&nbsp;<em>Modules</em>&nbsp;tab within each study &ndash; can be used to explore datasets and perform specific analyses. Some studies might also have additional analyses/reports available under the&nbsp;<em>Reports</em>&nbsp;tab. Most of these reports perform and summarize standardized analyses, but some perform analyses that are tailored to specific studies. A few examples of such modules/analyses are listed below:</p>
                <ul>
                    <li>Identification of gene expression signature of antibody responses using the&nbsp;<a href="/ImmuneResponsePredictor/Studies/SDY269/begin.view">Immune Response Predictor module</a>.</li>
                    <li>Module-based analysis of gene expression changes over time using the&nbsp;<a href="/GeneSetEnrichmentAnalysis/Studies/SDY269/begin.view">Gene Set Enrichment Analysis module</a>.</li>
                    <li>A <a href="../Studies/SDY207/begin.view?pageId=Visualization">custom report</a> to perform automated gating of CyTOF data using&nbsp;<a href="http://opencyto.org/" target="_blank">OpenCyto</a>&nbsp;and 3-D visualization using <a href="https://cran.r-project.org/web/packages/plotly/index.html" target="_blank">plotly</a>.</li>
                </ul>
                <p>All of the analyses make use of the R statistical language, leverage&nbsp;<a href="http://rforge.net/Rserve/" target="_blank">Rserve</a> to improve performance and&nbsp;<a href="http://yihui.name/knitr/" target="_blank">knitr</a>&nbsp;to enable full reproducibility. If you want to learn more about the <strong>computational tools</strong>&nbsp;developed as part of HIPC (and associated efforts), please visit the <a href="/project/home/begin.view?pageId=Tools">Tools</a> page.</p>
                <p><strong>Getting started:</strong>&nbsp;You first task will be to identify a study you would like to explore, and this can easily be done using the built-in <a href="/project/Studies/begin.view?">Data Finder</a>. You can then use the built-in study tools and modules to learn more about the selected study, explore, visualize and export specific data sets, and perform standardized analyses. For more detailed instructions please visit the <a href="/project/home/begin.view?pageId=Tutorials">Tutorials</a> page. If you have any questions or need any help, please visit the&nbsp;<a href="/project/home/support/begin.view">support page</a>.</p>
                <p>You can also easily interact with ImmuneSpace and download data via <a href="https://www.r-project.org/" target="_blank">R</a> using the&nbsp;<a href="https://bioconductor.org/packages/release/bioc/html/ImmuneSpaceR.html" target="_blank">ImmuneSpaceR</a>&nbsp;package, again, please visit the&nbsp;<a href="/project/home/begin.view?pageId=Tools">Tools</a>&nbsp;page for more details.</p>
            </div>
        )
    }

    // --------- TOOLS -----------------
    const Tools: React.FC = () => { 
        return(
            <div id="Tools">
                <ul>
                    <li><a href="http://icahn.mssm.edu/immuneregulation" target="_blank">ImmuneRegulation</a> is a user-friendly web interface that allows you to interactively explore the regulation of your genes and/or gene sets of interest by querying their regulation in the eQTL, Transcription Factor, and GQAS datasets in real time. ImmuneRegulation was developed by the&nbsp;<a href="http://research.mssm.edu/gumuslab/" target="_blank">Gumus</a> lab at the Mount Sinai School of Medicine.</li>
                    <li>The <a href="http://software.broadinstitute.org/gsea/msigdb/collection_details.jsp#C7" target="_blank">immune signature collection</a> part of MSigDB created by the <a href="http://haining.dfci.harvard.edu/" target="_blank">Haining lab</a>.</li>
                    <li>The <a href="https://gxb.benaroyaresearch.org/dm3/landing.gsp" target="_blank">interactive gene expression browser</a>&nbsp;(GXB) developed by the <a href="http://www.sidra.org/damien-chaussabel/" target="_blank">Chaussabel lab</a>. GXB is described in <a href="http://www.translational-medicine.com/content/13/1/196" target="_blank">this paper</a>.</li>
                    <li><a href="http://www.immuneprofiling.org/innate/landing.gsp">Meta Comparison Analysis Tool (MetaCAT)</a>&nbsp;developed by the&nbsp;<a href="http://www.sidra.org/damien-chaussabel/" target="_blank">Chaussabel lab</a>.</li>
                    <li><a href="http://insilico.utulsa.edu/index.php/reliefseq/" target="_blank">ReliefSeq</a> is a machine learning feature selection method for GWAS, RNA-Seq and other high-dimensional data sets that is able to identify genetic variables that influence continuous or dichotomous outcomes through interactions with other genetic variables. ReliefSeq was developed by the&nbsp;<a href="http://insilico.utulsa.edu/" target="_blank">McKinney</a> and&nbsp;<a href="http://www.mayo.edu/research/faculty/oberg-ann-l-ph-d/bio-00027708" target="_blank">Oberg</a> labs. ReliefSeq is described in <a href="http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0081527" target="_blank">this paper</a>&nbsp;</li>
                </ul>
            </div>
        )
    }

    // --------- REPORTS -----------------
    // Define Components in list - one for each report (img, title, text)
    const Reports: React.FC = () => {
        // Define baseUrl 
        var baseUrl = window.location.origin;

        // Define path to image resources
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
        return(
            <div id="DataStandards">
                <div id="#cytometry">Cytometry</div>
                <div id="#gene-expression">Gene Expression</div>
                <div id="#immune-response">Immune Response</div>
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
                            dataRange={maBarPlotProps.dataRange}
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
                            dataRange={maLinePlotProps.dataRange}
                            linkBaseText={maLinePlotProps.linkBaseText}
                        />
                    )
                }
            }

            return(
                <div id="#most-accessed">
                    <h2>ImmuneSpace Usage Over Time or By Study</h2>
                    <p><b>For More Information:</b></p>
                    <ul>
                        <li>Select the plot using the dropdown</li>
                    </ul>
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
                const PLOTS_IN_ROW = 3

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

                // console.log(JSON.stringify(ssPlotPropsList[ssPlotsToShow]))
                
                // filter plot list
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
                    {/* <span>{JSON.stringify(ssData)}</span> */}
                    <h2>Similar Studies based on Assay Data or Study Design</h2>
                    <p><b>For More Information:</b></p>
                    <ul>
                        <li>Click on a point to go to the study overview page</li>
                        <li>Update the plot sets using the dropdown menu</li>
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
                id: "about",
                tag: "About",
                text: "About"
            },
            {
                id: "tools",
                tag: "Tools",
                text: "Tools",
            },
            {
                id: "reports",
                tag: "Reports",
                text: "Reports"
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
            }
        ]

       
        const navBarElements = divInfo.map(function(el){
            const itemId = "navbar-link-" + el.id;
            const href = "#" + el.tag;
    
            if(["DataStandards", "StudyStats"].indexOf(el.tag) !== -1){
                const className = "nav-item dropdown" + (divToShow == el.tag ? " active" : "");
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
                        <a className="dropdown-toggle" href={href} id={dropDownId} role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
            <nav className="navbar navbar-default">
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
            { divToShow == "About" ? <About/> : null}
            { divToShow == "Tools" ? <Tools/> : null}
            { divToShow == "Reports" ? <Reports/> : null}
            { divToShow == "DataStandards" ? <DataStandards/> : null}
            { divToShow == "StudyStats" ? <StudyStats/> : null}
        </div>
    )
}





// --------- EXPORT ------------
// There should be a single export: a component called "App"
export const App: React.FC = () => {

    // Must return a React Fragment
    return <ResourcesPage/>
}
