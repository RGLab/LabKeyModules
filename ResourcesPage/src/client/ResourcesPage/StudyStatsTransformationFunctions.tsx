import {BarPlotDatum} from "./PlotComponents/mostCitedBarPlot"
import {ScatterPlotDatum} from "./PlotComponents/similarStudyScatterPlot"

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
export const transformCiteData = (pmData, setTransformedPmData, setPmDataRange) =>{
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

export const transformSdyMetaData = (ssData, setTransformedSsData, setSsDataRange) => {
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
        setTransformedSsData(data)

        const MULTIPLIER = 1.1
        var xRange = getRangeFromIntArray(data, "x")
        var yRange = getRangeFromIntArray(data, "y")
        xRange = [ xRange[0] * MULTIPLIER, xRange[1] * MULTIPLIER]
        yRange = [ yRange[0] * MULTIPLIER, yRange[1] * MULTIPLIER]
        const tmpDataRanges = {x: xRange, y: yRange}
        setSsDataRange(tmpDataRanges)
    }
}

export const transformLogData = (maData, setTransformedMaData) => {
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