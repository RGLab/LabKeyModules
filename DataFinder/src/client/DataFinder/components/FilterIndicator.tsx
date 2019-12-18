import * as React from 'react'
import * as LABKEY from '@labkey/api'
import { Filter, SelectedFilters, SelectedFilter } from "../../typings/CubeData";

interface FilterSummaryProps {
    filters: SelectedFilters
}

interface FilterIndicatorFlagProps {
    dim: string;
    filter: FilterInfo;
}

interface FilterInfo {
    name: string;
    members: string[];
    operator: string;
}

const filterMembers = {
    "study": ["Study", "Species", "Condition", "ExposureMaterial", "ExposureProcess", "ResearchFocus"],
    "participant": ["Gender", "Race", "Age"],
    "sample": ["Assay", "SampleType", "Timepoint"]
}


// Filter stuff... ========================================================
export const FilterSummary: React.FC<FilterSummaryProps> = (props) => {
    // organize props by study, subject, data
    const studyFilters: FilterInfo[] = []
    const participantFilters: FilterInfo[] = []
    const dataFilters: FilterInfo[] = []
    Object.keys(props.filters).forEach((e, i) => {
        const dimlevel = e.split(".")
        const filterInfo: FilterInfo = {name: dimlevel[1], ...props.filters[e]}
        if(dimlevel[0] == "study") studyFilters.push(filterInfo)
        if(dimlevel[0] == "subject") participantFilters.push(filterInfo)
        if(dimlevel[0] == "data") dataFilters.push(filterInfo)
    })

    
    return (
    <div>
        <FilterIndicatorList 
            filterClass = {"study"} 
            filters = {studyFilters} 
            title = {"Study Design"}/>
        <FilterIndicatorList
            filterClass = {"participant"}
            filters = {participantFilters}
            title = {"Participant Characteristics"}/>
        <FilterIndicatorList
            filterClass = {"sample"}
            filters = {dataFilters}
            title = {"Available Data"}/>
    </div>
    )
}

function FilterIndicatorList(props) {
    // props: filter class, filters, title text
    var filterFlags;
    if (props.filters.length == 0) {
        filterFlags = <em className = "filter-indicator">No filters currently applied</em>
    } else {
        filterFlags = props.filters.map((filter) => 
            <FilterIndicatorFlag key = {filter.name} dim={props.filterClass} filter={filter} />
        )
    }
    return (
        <div>
        <h4>{props.title}</h4>
        {filterFlags}
        </div>
    )
}

const FilterIndicatorFlag: React.FC<FilterIndicatorFlagProps> = (props) => {
    const text = props.filter.members.join(" " + props.filter.operator + " ")
    return (
        <div className = "filter-indicator">
            <div className = {"filter-indicator-text " + props.dim}>
                <b>{props.filter.name}: </b>{text}</div>
        </div>
    )
}



// function getFilter(filter) {
//     const re = /\[[^\[\]]+\]$/;
//     return filter.match(re);
// }



// // Summary ==============================================================

// function App(props) {
//     const [participantCount, setParticipantCount] = React.useState(0);
//     const [studyCount, setStudyCount] = React.useState(0);
//     const [filters, setFilters] = React.useState({"study": [], "participant": [], "sample": []})
    
//     var filterKey = "";
//     var filterFound = false;
//     var i = 0;
//     var re = /filterSet/
//     while (!filterFound && i < localStorage.length ) {
//         filterKey = localStorage.key(i);
//         filterFound = re.test(filterKey);
//         i++
//     }


//     // LABKEY.contextPath = '';
//     // LABKEY.container = {path: 'Studies'};

//     React.useEffect(() => update(), [])

//     // update 
//     function update() {

//         // Summary 
//         LABKEY.Query.selectRows({
//             schemaName: 'study',
//             queryName: "StudyProperties",
//             success: (data) => {setStudyCount(data.rowCount);}
//         });
//         LABKEY.Query.selectRows({
//             schemaName: "study",
//             queryName: "demographics",
//             success: (data) => {setParticipantCount(data.rowCount);}
//         })

//         // Filters
//         const filters_tmp = {"study": [], "participant": [], "sample": []}
//         const allFilters = JSON.parse(localStorage.getItem(filterKey));
//         const filterKeys = Object.keys(allFilters)
//         filterKeys.forEach((key) => {
//             if (filterMembers.study.includes(key)) {
//                 filters_tmp.study.push(allFilters[key])
//             } else if (filterMembers.participant.includes(key)) {
//                 filters_tmp.participant.push(allFilters[key])
//             } else if (filterMembers.sample.includes(key)) {
//                 filters_tmp.sample.push(allFilters[key])
//             }
//         })
//         setFilters(filters_tmp);
//     }

//     // Get summary counts
//     LABKEY.contextPath = '';
//     LABKEY.container = {path: 'Studies'};
//     LABKEY.Query.selectRows({
//         schemaName: 'study',
//         queryName: "StudyProperties",
//         success: (data) => {setStudyCount(data.rowCount);}
//     });
//     LABKEY.Query.selectRows({
//         schemaName: "study",
//         queryName: "demographics",
//         success: (data) => {setParticipantCount(data.rowCount);}
//     })

//     return(
//         <div className='container wrapper'>
//             <h2>Current Filters</h2>
//             <button type="button" onClick={update}>Update</button>
//             <p><em>{participantCount} participants from {studyCount} studies</em></p>
//             <FilterSummary filters = {filters} />
//         </div>
//     )

// }