import * as React from 'react';
import * as LABKEY from '@labkey/api';


// These are the members of each class of filters: 
// Used for parsing filters from localStorage
const filterMembers = {
    "study": ["Study", "Species", "Condition", "ExposureMaterial", "ExposureProcess", "ResearchFocus"],
    "participant": ["Gender", "Race", "Age"],
    "sample": ["Assay", "SampleType", "Timepoint"]
}


// Filter stuff... ========================================================
function FilterSummary(props) {
    // props: object with filter organized by study, participant, sample
    
    return (
    <div>
        <FilterIndicatorList 
            filterClass = {"study"} 
            filters = {props.filters.study} 
            title = {"Study Design"}/>
        <FilterIndicatorList
            filterClass = {"participant"}
            filters = {props.filters.participant}
            title = {"Participant Characteristics"}/>
        <FilterIndicatorList
            filterClass = {"sample"}
            filters = {props.filters.sample}
            title = {"Available Data"}/>
    </div>
    )
}

function FilterIndicatorFlag(props) {
    // props: filter class, filter
    var text = ""
    props.filter.members.forEach((e, i, a) => {
        text = text + getFilter(e);
        if (i < a.length - 1) text = text + " " + props.filter.operator + " ";
    });
    return (
        <div className = "filter-indicator">
            <div className = {"filter-indicator-text " + props.filterClass}>
                <b>{props.filter.name}: </b>{text}</div>
        </div>
    )
}

function FilterIndicatorList(props) {
    // props: filter class, filters, title text
    var filterFlags;
    if (props.filters.length == 0) {
        filterFlags = <em className = "filter-indicator">No Filters Applied</em>
    } else {
        filterFlags = props.filters.map((filter) => 
            <FilterIndicatorFlag key = {filter.name} filterClass={props.filterClass} filter={filter} />
        )
    }
    return (
        <div>
        <h4>{props.title}</h4>
        {filterFlags}
        </div>
    )
}

function getFilter(filter) {
    const re = /\[[^\[\]]+\]$/;
    return filter.match(re);
}



// Summary ==============================================================

function FilterView(props) {
    const [participantCount, setParticipantCount] = React.useState(0);
    const [studyCount, setStudyCount] = React.useState(0);
    const [filters, setFilters] = React.useState({"study": [], "participant": [], "sample": []})
    
    var filterKey = "";
    var filterFound = false;
    var i = 0;
    var re = /filterSet/
    while (!filterFound && i < localStorage.length ) {
        filterKey = localStorage.key(i);
        filterFound = re.test(filterKey);
        i++
    }


    // LABKEY.contextPath = '';
    // LABKEY.container = {path: 'Studies'};

    React.useEffect(() => update(), [])

    // update 
    function update() {

        // Summary 
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: "StudyProperties",
            success: (data) => {
                const d: any = data;
                const rowCount = d.rowCount;
                setStudyCount(rowCount);}
        });
        LABKEY.Query.selectRows({
            schemaName: "study",
            queryName: "demographics",
            success: (data) => {
                const d: any = data;
                const rowCount = d.rowCount;
                setParticipantCount(rowCount);}
        })

        // Filters
        const filters_tmp = {"study": [], "participant": [], "sample": []}
        const allFilters = JSON.parse(localStorage.getItem(filterKey));
        const filterKeys = Object.keys(allFilters)
        filterKeys.forEach((key) => {
            if (filterMembers.study.indexOf(key) !== -1) {
                filters_tmp.study.push(allFilters[key])
            } else if (filterMembers.participant.indexOf(key) !== -1) {
                filters_tmp.participant.push(allFilters[key])
            } else if (filterMembers.sample.indexOf(key) !== -1) {
                filters_tmp.sample.push(allFilters[key])
            }
        })
        setFilters(filters_tmp);
    }

    // go to data finder
    function goToDF() {
        window.location.href = './begin.view?'
    }

    return(
        <div className='container wrapper'>
            <h2>Current Filters</h2>
            <button type="button" onClick={update}>Update</button>
            <button type="button"><a href="./begin.view?">Edit</a></button>
            <p><em>{participantCount} participants from {studyCount} studies</em></p>
            <FilterSummary filters = {filters} />
        </div>
    )

}

export function App(props) {

    return <FilterView />

}
