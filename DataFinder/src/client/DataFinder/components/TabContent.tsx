import React from 'react';
import { AssayTimepointViewerContainer } from './AssayTimepointViewer'
import { Barplot, } from './Barplot'
import { SelectedFilters, FilterCategories, PlotData } from '../../typings/CubeData';
import { SampleTypeCheckbox } from './HeatmapSelector';
import { StudyCard } from './StudyCard'
import { StudyDict, StudyParticipantCount } from '../../typings/StudyCard';
import { RowOfButtons } from './FilterDropdown';
import { List } from 'immutable'

// Helpers
const BarplotHelper = (data, dim, level, filterCategories) => {
    let barColor: string, countMetric : string
    if (dim == "Study") {
        barColor = "#af88e3"
        countMetric = "studyCount"
    } else if (dim == "Subject") {
        barColor = "#95cced"
        countMetric = "participantCount"
    } else if (dim == "Data") {
        barColor = "#74C476"
        countMetric = "participantCount"
    }
    return (
        <Barplot
            data={data.get(level)}
            name={level}
            height={240}
            width={250}
            categories={filterCategories[level]}
            countMetric={countMetric}
            barColor={barColor} />
    )
}

const BarplotMemo = React.memo(Barplot)
const AssayTimepointMemo = React.memo(AssayTimepointViewerContainer)

interface SelectedStudiesProps {
    studyDict: StudyDict;
    studyParticipantCounts: List<StudyParticipantCount>
}

interface SelectedParticipantsProps {
    filterCategories: FilterCategories,
    plotData: PlotData
}

// SelectedStudies
export const SelectedStudies: React.FC<SelectedStudiesProps> = ({studyDict, studyParticipantCounts}) => {
    if (studyDict) {
        return <>
            {
                studyParticipantCounts?.map((sdy) => {
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
    } else {
        return <></>
    }
}

// SelectedParticipants

export const SelectedParticipants: React.FC<SelectedParticipantsProps> = ({filterCategories, plotData}) => {
    if (filterCategories == undefined || plotData == undefined) return <></>
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
            categories={filterCategories.Age}
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

// export const Data = ({ data, filterCategories }) => {
//     const [showSampleType, setShowSampleType] = React.useState<boolean>(false)
//     return (
//         <>
//             <div className="row">
//                 <div>

//                     {filterCategories &&
//                         <>
//                             <div className="row">
//                                 <div className="col-sm-8">
//                                     <h4 style={{ textAlign: "center" }}>Assays Available by Study Day</h4>

//                                     <SampleTypeCheckbox toggleShowSampleType={() => setShowSampleType(!showSampleType)} showSampleType={showSampleType} />
//                                     <AssayTimepointViewerContainer
//                                         name={"heatmap1"}
//                                         data={data.toJS()}
//                                         showSampleType={showSampleType}
//                                         selected={new SelectedFilters().Data}
//                                         timepointCategories={filterCategories.Timepoint}
//                                         sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />
//                                 </div>
//                                 <div className="col-sm-4">
//                                     {BarplotHelper(data.get("SampleType"), "Data", "SampleType", filterCategories)}
//                                 </div>
//                             </div>
//                         </>}


//                 </div>
//             </div>
//             <hr />
//             <div>
//                 <h2>Data From Selected Participants</h2>
//             </div>
//             <div id="data-views" />
//         </>
//     )

// }

// export const Participant = ({ showBarplots, data, filterCategories }) => {
//     return (
//         <>
//             <div className="row">
//                 {showBarplots && <>
//                     <div className="col-sm-4">
//                         {BarplotHelper(data, "Subject", "Gender", filterCategories)}
//                     </div>
//                     <div className="col-sm-4">
//                         {BarplotHelper(data, "Subject", "Age", filterCategories)}
//                     </div>
//                     <div className="col-sm-4">
//                         {BarplotHelper(data, "Subject", "Race", filterCategories)}
//                     </div>
//                 </>}


//             </div>
//             <hr></hr>
//             <h2 style={{ padding: "15px" }}>Selected Participants</h2>
//             <div className="row">
//                 <div id="participant-data" className="df-embedded-webpart"></div>
//             </div>

//         </>
//     )

// }

// export const Study = ({ data, filterCategories, studyDict, studyParticipantCounts, StudyCard, filterClick }) => {
//     return (
//         <>
//             <div className="row">
//                 {filterCategories && <>
//                     <div className="col-sm-3">
//                         {BarplotHelper(data, "Study", "Condition", filterCategories)}
//                     </div>
//                     <div className="col-sm-3">
//                         {BarplotHelper(data, "Study", "ExposureProcess", filterCategories)}
//                     </div>
//                     <div className="col-sm-3">
//                         {BarplotHelper(data, "Study", "ResearchFocus", filterCategories)}
//                     </div>
//                     <div className="col-sm-3">
//                         {BarplotHelper(data, "Study", "ExposureMaterial", filterCategories)}
//                     </div>
//                 </>}

//             </div>
//             <hr></hr>
//             <div>
//                 <h2>Selected Studies</h2>
//             </div>
//             {studyDict && studyParticipantCounts.map((sdy) => {
//                 if (sdy.participantCount > 0 && studyDict[sdy.studyName]) {
//                     return (
//                         <StudyCard key={sdy.studyName}
//                             study={studyDict[sdy.studyName]}
//                             participantCount={sdy.participantCount}
//                             filterClick={filterClick} />
//                     )
//                 }
//             })}
//         </>
//     )
// }