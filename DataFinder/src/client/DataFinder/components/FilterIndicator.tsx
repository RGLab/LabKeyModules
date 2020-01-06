import * as React from 'react'
import * as LABKEY from '@labkey/api'
import { Filter, SelectedFilters, SelectedFilter, CubeData } from "../../typings/CubeData";
import { Map } from 'immutable'

interface FilterSummaryProps {
    filters: SelectedFilters
}

interface FilterIndicatorListProps {
    filterClass: string;
    filters: Map<string, SelectedFilter>;
    title: string;
}

interface AssayFilterIndicatorListProps {
    filters: Map<string, Map<string, SelectedFilter> | SelectedFilter>;
    title: string
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
                filterClass={"study"}
                filters={props.filters.study}
                title={"Study Design"} />
            <FilterIndicatorList
                filterClass={"participant"}
                filters={props.filters.subject}
                title={"Participant Characteristics"} />
            <AssayFilterIndicatorList
                filters={props.filters.data}
                title={"Available Data"} />
        </div>
    )
}

const AssayFilterIndicatorList: React.FC<AssayFilterIndicatorListProps> = (props) => {
    let filterFlags;
    if (props.filters.size == 0 || 
        (props.filters.getIn(["assay", "timepoint"]) == undefined && 
        props.filters.getIn(["assay", "assay"]) == undefined && 
        props.filters.get("timepoint") == undefined)) {
        filterFlags = <em className="filter-indicator">No filters currently applied</em>
    } else {
        const filters = Map<string, SelectedFilter>({
            "Assay.Assay": props.filters.getIn(["assay", "assay"]),
            "Assay.Timepoint": props.filters.getIn(["assay", "timepoint"]),
            "Assay.SampleType": props.filters.getIn(["assay", "sampleType"]),
            "SampleType.SampleType": props.filters.getIn(["sampleType", "sampleType"]),
            "Timepoint": props.filters.get("timepoint")
        })
        const filterText = filters.map((e, i) => {
            if (e == undefined) return (undefined);
            if (i == "Assay.Timepoint") {
                const textArray = e.members.map((m) => {
                    const assay = m.split(/\./)[0]
                    const timepoint = m.split(/\./)[1]
                    return (assay + " at " + timepoint + " days")
                })
                return (textArray.join(" " + e.operator + " "))
            }
            if (i == "Assay.SampleType") {
                const textArray = e.members.map((m) => {
                    const assay = m.split(/\./)[0]
                    const timepoint = m.split(/\./)[1]
                    const sampleType = m.split(/\./)[2]
                    return (assay + " (" + sampleType + ") at " + timepoint + " days")
                })
                return (textArray.join(" " + e.operator + " "))
            }
            return (i.split(/\./)[0] + " is " + e.members.join(" " + e.operator + " "))
        })

        filterFlags = filterText.valueSeq().map((text, i) => {
            if (text == undefined) return (undefined)
            return (
                <div key={i} className="filter-indicator">
                    <div className={"filter-indicator-text sample"}>{text}</div>
                </div>
            )
        })
    }


    return (
        <div>
            <h4>{props.title}</h4>
            {filterFlags}
        </div>
    )
}

const FilterIndicatorList: React.FC<FilterIndicatorListProps> = (props) => {
    // props: filter class, filters, title text
    let filterFlags
    // debugger;
    if (props.filters.size == 0) {
        filterFlags = <em className="filter-indicator">No filters currently applied</em>
    } else {
        const filterKeys = props.filters.keySeq();
        filterFlags = filterKeys.map((key: string) => {
            return (<FilterIndicatorFlag key={props.filters.getIn([key, "members"])} dim={props.filterClass} filter={props.filters.get(key)} level={key} />)
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
        <div className="filter-indicator">
            <div className={"filter-indicator-text " + props.dim}>
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