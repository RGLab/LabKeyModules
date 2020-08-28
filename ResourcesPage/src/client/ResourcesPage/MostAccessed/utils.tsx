import { 
    MaBarPlotDatum,
    MaBarPlotProps,
    MaLinePlotDatum,
    MaLinePlotProps,
    MaPlotTitles
} from '../PlotComponents/mostAccessedPlots'


export const createLinePlotProps = (data, handleresults) => {
    // logic for updating titles
    const lineTitles: MaPlotTitles = {
        x: 'Date',
        y: 'Number of User Interactions',
        main: 'ImmuneSpace Usage over Time'
    }

    const lineData = []
    const lineLabels = []
    data.forEach(element => {
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

    handleresults(lineProps);
}

export const createBarPlotProps = (data, order, labkeyBaseUrl, handleresults) => {
    // Remove zero values to avoid odd looking chart since sorting is done
        // using a quicksort that leaves secondary sort in groups
        const tmp = JSON.parse(JSON.stringify(data))
        var tmpStudyData = tmp.filter(el => el[order] > 10)
        tmpStudyData.sort((a,b) => (a[order] > b[order]) ? 1 : -1)
    
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

        handleresults(barProps);
}