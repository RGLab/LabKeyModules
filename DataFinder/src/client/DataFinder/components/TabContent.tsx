import React from 'react';
import { AssayTimepointViewerContainer } from './AssayTimepointViewer'
import { Barplot, } from './Barplot'
import { SelectedFilters, FilterCategories, PlotData } from '../../typings/CubeData';
import { StudyCard } from './StudyCard'
import { StudyDict, StudyParticipantCount } from '../../typings/StudyCard';
import { RowOfButtons } from './reusable/Buttons';
import { List, Iterable } from 'immutable'
import { Loader } from './reusable/Loader';
import { SimpleDropdown } from './reusable/Dropdowns';


const BarplotMemo = React.memo(Barplot)
const AssayTimepointMemo = React.memo(AssayTimepointViewerContainer)

interface SelectedStudiesProps {
    studyDict: StudyDict;
    studyParticipantCounts: List<StudyParticipantCount>
}

interface SelectedParticipantsProps {
    filterCategories: FilterCategories;
    plotData: PlotData
}

// SelectedStudies
export const SelectedStudies: React.FC<SelectedStudiesProps> = ({studyDict, studyParticipantCounts}) => {
    if (!studyDict || studyParticipantCounts.size === 0) return <Loader/>
    
    const [sortBy, setSortBy] = React.useState<string>("study_accession")
    const [sortedCounts, setSortedCounts] = React.useState<Iterable<number, StudyParticipantCount>>(studyParticipantCounts)
    const sortMap = {
        study_accession: "Study ID",
        pi_names: "First Author",
        total_participants: "Total Participants (descending)",
        selected_participants: "Selected Participants (descending)",
        title: "Title",
        assay_count: "Number of available assays (descending)"
    }

    React.useEffect(() => {
        setSortedCounts(studyParticipantCounts.sort(sortFn[sortBy]))
    }, [studyParticipantCounts])



    const sortFn: {[index: string]: (a: StudyParticipantCount, b: StudyParticipantCount) => number} = {
        study_accession: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            const studyId1 = parseInt(spc1.studyName.replace("SDY", ""))
            const studyId2 = parseInt(spc2.studyName.replace("SDY", ""))
            return studyId1 - studyId2
        }, 
        pi_names: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            const firstAuthor1 = studyDict[spc1.studyName].pi_names.replace(/,.+/, "")
            const firstAuthor2 = studyDict[spc2.studyName].pi_names.replace(/,.+/, "")
            const lastName1 = firstAuthor1.replace(/^.+\s/, "").toLowerCase()
            const lastName2 = firstAuthor2.replace(/^.+\s/, "").toLowerCase()
            if (lastName1 > lastName2) return 1
            return -1   
        },
        total_participants: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            return studyDict[spc2.studyName].totalParticipantCount - studyDict[spc1.studyName].totalParticipantCount
        },
        selected_participants: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            const count1 = spc1.participantCount
            const count2 = spc2.participantCount 
            return count2 - count1
        },
        title: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            if (studyDict[spc1.studyName].brief_title > studyDict[spc2.studyName].brief_title) return 1
            return -1
        },
        assay_count: (spc1: StudyParticipantCount, spc2: StudyParticipantCount)  => {
            const assay_count1 = studyDict[spc1.studyName].assays?.split(",").length ?? 0
            const assay_count2 = studyDict[spc2.studyName].assays?.split(",").length ?? 0
            return assay_count2 - assay_count1
        },
    }


    const buttonData = Object.keys(sortFn).map(key => {
        return {
            label: sortMap[key],
            action: () => {
                setSortedCounts((prevSortedCounts) => prevSortedCounts.sort(sortFn[key]))
                setSortBy(key)
            }
        }
    })

        return <>
        <div>
            <span style={{display: "inline-block"}}>Sort By:</span>
            <div style={{display: "inline-block"}}>
                <SimpleDropdown title={sortMap[sortBy]} buttonData={buttonData} />
            </div>    
        </div>
            {
                sortedCounts.map((sdy) => {
                    if (sdy.participantCount > 0 && studyDict[sdy.studyName]) {
                        return (
                            <StudyCard key={sdy.studyName}
                                study={studyDict[sdy.studyName]}
                                participantCount={sdy.participantCount}/>
                        )
                    }
                })
            }
        </>
}



// SelectedParticipants

export const SelectedParticipants: React.FC<SelectedParticipantsProps> = ({filterCategories, plotData}) => {
    if (filterCategories == undefined || plotData == undefined) return <Loader />
    return <RowOfButtons>
        <BarplotMemo
            data={plotData.getIn(["Study", "Condition"])}
            name={"Condition"}
            height={240}
            width={250}
            categories={filterCategories.Condition}
            countMetric={"participantCount"}
            barColor={"#af88e3"}/>
        <BarplotMemo 
            data={plotData.getIn(["Study", "ResearchFocus"])}
            name={"ResearchFocus"}
            height={240}
            width={250}
            categories={filterCategories.ResearchFocus}
            countMetric={"participantCount"}
            barColor={"#af88e3"}/>
        <BarplotMemo 
            data={plotData.getIn(["Subject", "Age"])}
            name={"Age"}
            height={240}
            width={250}
            categories={filterCategories.Age}
            countMetric={"participantCount"}
            barColor={"#95cced"}/>
        <BarplotMemo 
            data={plotData.getIn(["Subject", "Race"])}
            name={"Race"}
            height={240}
            width={250}
            categories={filterCategories.Race}
            countMetric={"participantCount"}
            barColor={"#95cced"}/>
        <BarplotMemo 
            data={plotData.getIn(["Subject", "Gender"])}
            name={"Gender"}
            height={240}
            width={250}
            categories={filterCategories.Gender}
            countMetric={"participantCount"}
            barColor={"#95cced"}/>
        <BarplotMemo
            data={plotData.getIn(["Data", "SampleType", "SampleType"])}
            name={"SampleType"}
            height={240}
            width={250}
            categories={filterCategories.SampleType}
            countMetric={"participantCount"}
            barColor={"#74C476"}/>
        <AssayTimepointMemo
            name={"heatmap1"}
            data={plotData.Data.toJS()}
            timepointCategories={filterCategories.Timepoint}
            sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />
        
    </RowOfButtons>
}
