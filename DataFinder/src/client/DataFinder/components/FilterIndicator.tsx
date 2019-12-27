import * as React from 'react'
import * as LABKEY from '@labkey/api'
import { Filter, SelectedFilters, SelectedFilter } from "../../typings/CubeData";
import {Map} from 'immutable'

interface FilterSummaryProps {
    filters: SelectedFilters
}

interface FilterIndicatorListProps {
    filterClass: string;
    filters: Map<string, SelectedFilter>;
    title: string;
}

interface FilterIndicatorFlagProps {
    dim: string;
    filter: SelectedFilter;
    level: string;
}


const filterMembers = {
    "study": ["Study", "Species", "Condition", "ExposureMaterial", "ExposureProcess", "ResearchFocus"],
    "participant": ["Gender", "Race", "Age"],
    "sample": ["Assay", "SampleType", "Timepoint"]
}


// Filter stuff... ========================================================
export const FilterSummary = (props: FilterSummaryProps) => {
    
    // if (props.filters.subject.size != 0) debugger;
    
    return (
    <div>
        <FilterIndicatorList 
            filterClass = {"study"} 
            filters = {props.filters.study} 
            title = {"Study Design"}/>
        <FilterIndicatorList
            filterClass = {"participant"}
            filters = {props.filters.subject}
            title = {"Participant Characteristics"}/>
        <FilterIndicatorList
            filterClass = {"sample"}
            filters = {props.filters.data}
            title = {"Available Data"}/>
    </div>
    )
}

const FilterIndicatorList: React.FC<FilterIndicatorListProps> = (props) => {
    // props: filter class, filters, title text
    let filterFlags
    // debugger;
    if (props.filters.size == 0) {
        filterFlags = <em className = "filter-indicator">No filters currently applied</em>
    } else {
        const filterKeys = props.filters.keySeq();
        filterFlags = filterKeys.map((key:string) => {
            return(<FilterIndicatorFlag key = {props.filters.getIn([key, "members"])} dim={props.filterClass} filter={props.filters.get(key)} level={key} />)
        })
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
                <b>{props.level}: </b>{text}</div>
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