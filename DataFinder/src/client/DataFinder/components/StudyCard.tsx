import * as React from 'react';
import { IStudyInfo } from '../../typings/StudyCard';
import { TinyHeatmap } from '../components/TinyHeatmap';
import "./StudyCard.scss"

// Types
interface StudyPropertyProps {
    key: string;
    label: string;
    value: string;
}

interface StudyPropertiesProps {
    studyProperties: StudyProperty[];
}

interface StudyProgressBarProps {
    totalParticipantCount: number;
    selectedParticipantCount: number;
}

interface StudyProperty {
    label: string;
    value: string;
}

interface StudyCardProps {
    key: string;
    study: IStudyInfo;
    participantCount: number;
}

// Components
const StudyProperty: React.FC<StudyPropertyProps> = (props) => {
    const labelStyle: React.CSSProperties = {
        fontWeight: "bold",
    }
    return (
        <p className="card-text"><span style={labelStyle}>{props.label}: </span>{props.value}</p>
    )
}

const StudyProperties: React.FC<StudyPropertiesProps> = (props) => {

    const  studyProperties = props.studyProperties.map((property) => {
        return (
            <StudyProperty key={property.label} label={property.label} value={property.value} />
        )
    })

    return (
        <div className="study-properties">
            {studyProperties}
        </div>
    )

}

const StudyProgressBar: React.FC<StudyProgressBarProps> = (props) => {
    const pbarStyle = {
        width: (props.selectedParticipantCount / props.totalParticipantCount * 100) + "%"
    }
    return (
        <div>
            <div className="progress">
                <div className="progress-bar"
                    role="progressbar"
                    aria-valuenow={props.selectedParticipantCount}
                    aria-valuemin={0}
                    aria-valuemax={props.totalParticipantCount}
                    style={pbarStyle}>
                </div>
            </div>
            <p>
                <em>{props.selectedParticipantCount} of {props.totalParticipantCount} participants selected.</em>
            </p>
        </div>
    )
}

export const StudyCardFC: React.FC<StudyCardProps> = (props) => {
    const study = props.study;
    const studyProperties: StudyProperty[] = [
        {
            label: "Research Focus",
            value: study.research_focus
        },
        {
            label: "Sample Type",
            value: study.sample_type
        },
        {
            label: "Assays",
            value: study.assays
        }
    ]
    const authors = study.pi_names.split(",")
    const author = authors.length > 1 ? (authors[0] + " et. al.") : authors[0]


    return (
        <div className="study-card">
            <div className="study-label">
            <span className="study-id">{study.study_accession}</span>
                <span className="study-pi">{author}</span>
            </div>
            <hr />
            <a href={"./" + study.study_accession + "/begin.view?"} className="labkey-text-link labkey-study-card-goto">
                learn more
            </a>
            <div className="study-title">
                {study.brief_title}
            </div>
            <StudyProgressBar totalParticipantCount={study.totalParticipantCount} selectedParticipantCount={props.participantCount} />
            <StudyProperties studyProperties={studyProperties} />
            <hr></hr>
            <TinyHeatmap
                name={study.study_accession} 
                heatmapInfo={study.heatmapInfo}/>           
        </div>
    )
}

export const StudyCard = React.memo(StudyCardFC)