import * as React from 'react';
import { StudyInfo } from '../../typings/StudyCard';
import { TinyHeatmap } from '../components/TinyHeatmap';

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
    study: StudyInfo;
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

    const studyProperties = props.studyProperties.map((property) => {
        return (
            <StudyProperty key={property.label} label={property.label} value={property.value} />
        )
    })

    return (
        <div>
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

export const StudyCard: React.FC<StudyCardProps> = (props) => {
    const study = props.study;
    const studyProperties: StudyProperty[] = [
        {
            label: "Condition",
            value: study.condition_studied
        },
        {
            label: "Sample Type",
            value: study.sample_type[0]
        },
        {
            label: "Assays",
            value: study.assays[0]
        }
    ]
    const heatmapColors = [
        "#FFFFFF",
        "#EDF8E9",
        "#C7E9C0",
        "#A1D99B",
        "#74C476",
        "#41AB5D",
        "#238B45",
        "#005A32"
    ];
    const heatmapBreaks = [
        1,5,10,20,50,100
    ]
    const assays = [];
    study.heatmapData.map((e, i) => {
        if (e.assay !== undefined && assays.indexOf(e.assay) === -1 && e.count > 0) assays.push(e.assay);
    });

    return (
        <div className="study-card">
            <div className="study-label">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="study" value="SDY28" />
                        <span className="study-id">{study.study_accession}</span>
                    </label>
                </div>
                <span className="study-pi">{study.pi_names}</span>
            </div>
            <hr />
            <a href={"./" + study.study_accession + "/begin.view?"} className="labkey-text-link labkey-study-card-goto">
                Go to study
            </a>
            <div className="study-title">
                {study.brief_title}
            </div>
            <StudyProgressBar totalParticipantCount={study.totalParticipantCount} selectedParticipantCount={props.participantCount} />
            <StudyProperties studyProperties={studyProperties} />
            <TinyHeatmap 
                name={study.study_accession} 
                width={260} 
                height={30 + 10 * assays.length} 
                data={study.heatmapData} 
                colors={heatmapColors}
                colorBreaks={heatmapBreaks}
                assays={assays}/>

            
        </div>
    )
}
