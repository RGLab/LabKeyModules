import React from 'react';
import { AssayTimepointViewerContainer } from './AssayTimepointViewer'
import { Barplot, } from './Barplot'
import { createFilterCategories } from '../helpers/CubeHelpers';
import { SelectedFilters, CubeData } from '../../typings/CubeData';

// Helpers
const BarplotHelper = (data, dim, level, filterCategories) => {
    return (
        <Barplot
            data={data.get(level)}
            name={level}
            height={200}
            width={250}
            categories={filterCategories[level]}
            countMetric={dim == "Study" ? "studyCount" : "participantCount"}
            barColor={dim == "Study" ? "#af88e3" : "#95cced"} />
    )
}

export const Data = ({ data, showSampleType, filterCategories }) => {
    return (
        <>
            <div className="row">
                <div>

                    {filterCategories &&
                        <>
                            <div className="row">
                                <div className="col-sm-8">
                                    <h4 style={{ textAlign: "center" }}>Assays Available by Study Day</h4>
                                    <AssayTimepointViewerContainer
                                        name={"heatmap1"}
                                        data={data.toJS()}
                                        showSampleType={showSampleType}
                                        selected={new SelectedFilters().Data}
                                        timepointCategories={filterCategories.Timepoint}
                                        sampleTypeAssayCategories={filterCategories.SampleTypeAssay} />
                                </div>
                                <div className="col-sm-4">
                                    <Barplot
                                        data={data.getIn(["SampleType", "SampleType"])}
                                        name={"SampleType"}
                                        height={200}
                                        width={250}
                                        categories={filterCategories["SampleType"]}
                                        countMetric={"participantCount"}
                                        barColor={"#74C476"} />
                                </div>
                            </div>
                        </>}


                </div>
            </div>
            <hr />
            <div>
                <h2>Data From Selected Participants</h2>
            </div>
            <div id="data-views" />
        </>
    )

}

export const Participant = ({ showBarplots, data, filterCategories }) => {
    return (
        <>
            <div className="row">
                {showBarplots && <>
                    <div className="col-sm-4">
                        {BarplotHelper(data, "Subject", "Gender", filterCategories)}
                    </div>
                    <div className="col-sm-4">
                        {BarplotHelper(data, "Subject", "Age", filterCategories)}
                    </div>
                    <div className="col-sm-4">
                        {BarplotHelper(data, "Subject", "Race", filterCategories)}
                    </div>
                </>}


            </div>
            <hr></hr>
            <h2 style={{ padding: "15px" }}>Selected Participants</h2>
            <div className="row">
                <div id="participant-data" className="df-embedded-webpart"></div>
            </div>

        </>
    )

}

export const Study = ({ data, filterCategories, studyDict, studyParticipantCounts, StudyCardMemo, filterClick }) => {
    return (
        <>
            <div className="row">
                {filterCategories && <>
                    <div className="col-sm-3">
                        {BarplotHelper(data, "Study", "Condition", filterCategories)}
                    </div>
                    <div className="col-sm-3">
                        {BarplotHelper(data, "Study", "ExposureProcess", filterCategories)}
                    </div>
                    <div className="col-sm-3">
                        {BarplotHelper(data, "Study", "ResearchFocus", filterCategories)}
                    </div>
                    <div className="col-sm-3">
                        {BarplotHelper(data, "Study", "ExposureMaterial", filterCategories)}
                    </div>
                </>}

            </div>
            <hr></hr>
            <div>
                <h2>Selected Studies</h2>
            </div>
            {studyDict && studyParticipantCounts.map((sdy) => {
                if (sdy.participantCount > 0 && studyDict[sdy.studyName]) {
                    return (
                        <StudyCardMemo key={sdy.studyName}
                            study={studyDict[sdy.studyName]}
                            participantCount={sdy.participantCount}
                            filterClick={filterClick} />
                    )
                }
            })}
        </>
    )
}