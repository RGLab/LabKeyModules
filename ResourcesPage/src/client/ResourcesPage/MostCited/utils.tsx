import {BarPlotProps, BarPlotTitles} from '../PlotComponents/mostCitedBarPlot'

export function updatePmPlotData(transformedPmData, pmDataRange, pmOrderBy){
    if(transformedPmData.byPubId.length > 0){
        var copy = JSON.parse(JSON.stringify(transformedPmData))
        copy.byPubId.sort((a,b) => (a[pmOrderBy] > b[pmOrderBy]) ? 1 : -1)

        const titles: BarPlotTitles = {
            x: 'Number of Citations',
            y: 'Study and PubMed Id',
            main: 'Number of Citations by PubMed Id'
        }
    
        const plotProps: BarPlotProps = {
            data: copy.byPubId,
            titles: titles,
            name: "byPubId",
            width: 850,
            height: 700,
            dataRange: pmDataRange.byPubId,
            linkBaseText: 'https://www.ncbi.nlm.nih.gov/pubmed/'
        }
    return(plotProps)
    }
}