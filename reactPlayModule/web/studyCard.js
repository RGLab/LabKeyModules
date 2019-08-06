const rootElement = document.getElementById('study-card',)

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
    const studyProperties = [
        {
            label: "Exposure Material",
            value: "Fluvirin"
        },
        {
            label: "Condition",
            value: "Influenza"
        },
        {
            label: "Sample Type",
            value: "Other, Serum, PBMC"
        },
        {
            label: "Assays",
            value: "Gene Expression, Neutralizing Antibody, ELISPOT, Flow Cytometry"
        }
    ]

    return(
        <div className = "study-card">
            <div className="study-label">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="study" value="SDY28"/>
                        <span className="study-id">SDY28</span>
                    </label>
                </div>
                <span className="study-pi">Gregory Poland</span>
            </div>
            <hr/>
            <a href="./SDY28/begin.view?" className="labkey-text-link labkey-study-card-goto">
                Go to study
            </a>
            <div className="study-title">
                Humoral and Cell-Mediated Immune Responses to Vaccinia Virus Immunization
            </div>
            <StudyProgressBar totalParticipantCount={145} selectedParticipantCount={59} />
            <StudyProperties studyProperties={studyProperties}/>
            {/* <TinyHeatmap data={props.data}/> */}
        </div>
    )
}

ReactDOM.render(<StudyCard/>, rootElement);