

const rootElement = document.getElementById('study-panel',)

function StudyProperty(props) {
    const labelStyle = {
        fontWeight: "bold",
    }
    return(
        <p className="card-text"><span style={labelStyle}>{props.label}: </span>{props.value}</p>
    )
}

function StudyProperties(props) {

    return(
        props.studyProperties.map((property) => {
            return (
                <StudyProperty key={property.label} label={property.label} value={property.value} />
            )
        })
    )
    
}

function StudyProgressBar(props) {
    const pbarStyle = {
        width: ( props.selectedParticipantCount / props.totalParticipantCount * 100 ) + "%"
    }
    return (
        <div>
            <div className="progress">
                <div className="progress-bar"
                    role="progressbar"
                    aria-valuenow={props.selectedParticipantCount}
                    aria-valuemin="0"
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

function StudyCard(props) {
    const study = props.study;
    const studyProperties = [
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

    return(
        <div className = "study-card">
            <div className="study-label">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="study" value="SDY28"/>
                        <span className="study-id">{study.study_accession}</span>
                    </label>
                </div>
                <span className="study-pi">{study.pi_names}</span>
            </div>
            <hr/>
            <a href={"./" + study.study_accession + "/begin.view?"} className="labkey-text-link labkey-study-card-goto">
                Go to study
            </a>
            <div className="study-title">
                {study.brief_title}
            </div>
            <StudyProgressBar totalParticipantCount={145} selectedParticipantCount={59} />
            <StudyProperties studyProperties={studyProperties}/>
            {/* <TinyHeatmap data={props.data}/> */}
        </div>
    )
}

function StudyPanel(props) {
    const [studyData, setStudyData] = React.useState([])
    const update = () => {
        LABKEY.Query.selectRows({
        schemaName: 'immport', 
        queryName: 'dataFinder_studyCard',
        success: (data) => {console.log(data);setStudyData(data.rows)} })
    }
    
    React.useEffect(() => update(), [])
    
    return (
        <div>
            {studyData.map((study) => {
                return(
                    <StudyCard study={study}/>
                )
                
            })}
        </div>
            )
}

ReactDOM.render(<StudyPanel/>, rootElement);