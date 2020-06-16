import React from 'react';
import { AssayTimepointViewerContainer } from './AssayTimepointViewer'
import { Barplot, } from './Barplot'
import { SelectedFilters, FilterCategories, PlotData } from '../../typings/CubeData';
import { StudyCard } from './StudyCard'
import { IStudyInfo, StudyInfo } from '../../typings/StudyCard';
import { RowOfButtons } from './FilterDropdown';
import { List, Map } from 'immutable'
import { Loader } from './Loader';
import { DropdownButtons } from './ActionButton';


const BarplotMemo = React.memo(Barplot)
const AssayTimepointMemo = React.memo(AssayTimepointViewerContainer)

interface SelectedStudiesProps {
    studyInfoArray: IStudyInfo[];
    studyParticipantCounts: {[index: string]: number}
}

interface SelectedParticipantsProps {
    filterCategories: FilterCategories;
    plotData: PlotData
}

// SelectedStudies
export const SelectedStudies: React.FC<SelectedStudiesProps> = ({studyInfoArray, studyParticipantCounts}) => {
    if (!studyInfoArray) return <Loader/>

    const [sortBy, setSortBy] = React.useState("study_accession")
    const [studyInfo, setStudyInfo] = React.useState(studyInfoArray)

    const sortMap = {
        study_accession: "Study ID",
        pi_names: "First Author",
        total_participants: "Total Participants (descending)",
        selected_participants: "Selected Participants (descending)",
        title: "Title",
        assay_count: "Number of available assays (descending)"
    }

    const sortFn: {[index: string]: (a: IStudyInfo, b: IStudyInfo) => number} = {
        study_accession: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            const studyId1 = parseInt(studyInfo1.study_accession.replace("SDY", ""))
            const studyId2 = parseInt(studyInfo2.study_accession.replace("SDY", ""))
            return studyId1 - studyId2
        }, 
        pi_names: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            const firstAuthor1 = studyInfo1.pi_names.replace(/,.+/, "")
            const firstAuthor2 = studyInfo2.pi_names.replace(/,.+/, "")
            const lastName1 = firstAuthor1.replace(/^.+\s/, "").toLowerCase()
            const lastName2 = firstAuthor2.replace(/^.+\s/, "").toLowerCase()
            if (lastName1 > lastName2) return 1
            return -1   
        },
        total_participants: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            return studyInfo2.totalParticipantCount - studyInfo1.totalParticipantCount
        },
        selected_participants: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            const count1 = studyParticipantCounts[studyInfo1.study_accession] ?? 0
            const count2 = studyParticipantCounts[studyInfo2.study_accession] ?? 0
            return count2 - count1 
        },
        title: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            if (studyInfo1.brief_title > studyInfo2.brief_title) return 1
            return -1
        },
        assay_count: (studyInfo1: IStudyInfo, studyInfo2: IStudyInfo)  => {
            const assay_count1 = studyInfo1.assays?.split(",").length ?? 0
            const assay_count2 = studyInfo2.assays?.split(",").length ?? 0
            return assay_count2 - assay_count1
        },
    }

    const buttonData = Object.keys(sortFn).map(key => {
        return {
            label: sortMap[key],
            action: () => {
                setStudyInfo(studyInfoArray.slice().sort(sortFn[key]))
                setSortBy(key)
            }
        }
    })

    return <>
        <div>
            <span style={{display: "inline-block"}}>Sort By:</span>
            <div style={{display: "inline-block"}}>
                <DropdownButtons title={sortMap[sortBy]} buttonData={buttonData} />
            </div>    
        </div>
        {
                studyInfo?.map((studyInfo) => {
                    if (studyParticipantCounts[studyInfo.study_accession] > 0) {
                        return (
                            <StudyCard key={studyInfo.study_accession}
                                study={studyInfo}
                                participantCount={studyParticipantCounts[studyInfo.study_accession]}/>
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

// export const Study = ({ data, filterCategories, studyInfoArray, studyParticipantCounts, StudyCard, filterClick }) => {
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
//             {studyInfoArray && studyParticipantCounts.map((sdy) => {
//                 if (sdy.participantCount > 0 && studyInfoArray[sdy.studyName]) {
//                     return (
//                         <StudyCard key={sdy.studyName}
//                             study={studyInfoArray[sdy.studyName]}
//                             participantCount={sdy.participantCount}
//                             filterClick={filterClick} />
//                     )
//                 }
//             })}
//         </>
//     )
// }