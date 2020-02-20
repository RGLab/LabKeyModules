import * as React from 'react'
import * as LABKEY from '@labkey/api'
import { Filter, SelectedFilters, CubeData, SelectedFilter } from "../../typings/CubeData";
import { Map, List } from 'immutable'

export interface FilterSummaryProps {
    filters: SelectedFilters
}

interface FilterIndicatorListProps {
    filterClass: string;
    filters: Map<string, SelectedFilter>;
    title: string;
}

interface AssayFilterIndicatorListProps {
    filters: Map<string, Map<string, SelectedFilter> | SelectedFilter>;
    title?: string
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
        <div className="row filterbar">
            <div className="col-sm-4">
                <FilterIndicatorList
                    filterClass={"Study"}
                    filters={props.filters.Study}
                    title={"Study Design"} />
            </div>
            <div className="col-sm-4">
                <FilterIndicatorList
                    filterClass={"Subject"}
                    filters={props.filters.Subject}
                    title={"Participant Characteristics"} />
            </div>
            <div className="col-sm-4">
                <AssayFilterIndicatorList
                    filters={props.filters.Data}
                    title={"Available Data"} />
            </div>
        </div>
    )
}

export const AssayFilterIndicatorList: React.FC<AssayFilterIndicatorListProps> = ({filters, title}) => {
    let filterFlags;
    if (filters.size == 0 ||
        (filters.getIn(["Assay", "Timepoint"]) == undefined &&
            filters.getIn(["Assay", "Assay"]) == undefined &&
            filters.getIn(["Assay", "SampleType"]) == undefined &&
            filters.getIn(["SampleType", "SampleType"]) == undefined &&
            filters.getIn(["SampleType", "Assay"]) == undefined &&
            filters.get("Timepoint") == undefined)) {
        filterFlags = <em className="filter-indicator">No filters currently applied</em>
    } else {
        const filterMap = Map<string, SelectedFilter>({
            "Assay.Assay": filters.getIn(["Assay", "Assay"]),
            "Assay.Timepoint": filters.getIn(["Assay", "Timepoint"]),
            "Assay.SampleType": filters.getIn(["Assay", "SampleType"]),
            "SampleType.SampleType": filters.getIn(["SampleType", "SampleType"]),
            "SampleType.Assay": filters.getIn(["SampleType", "Assay"]),
            "Timepoint": filters.get("Timepoint")
        })
        const prefixes = {
            "Assay.Assay": "Assays at any timepoint: ",
            "Assay.Timepoint": "Assay at a certain timepoint: ",
            "Assay.SampleType": "Assay on a certain sample type at a certain timepoint: ",
            "SampleType.SampleType": "Any assay on these sample types: ",
            "SampleType.Assay": "Assay on a certain sample type for any timepoint: ",
            "Timepoint": "Any assay at these timepoints: "
        }
        const filterText = filterMap.map((e, i) => {
            if (e === undefined) return (undefined);
            // debugger
            const getText = (m: string, level: string) => {
                if (level == "Assay.SampleType") {
                    const assay = m.split(/\./)[0]
                    const timepoint = m.split(/\./)[1]
                    const sampleType = m.split(/\./)[2]
                    return (assay + " (" + sampleType + ") at " + timepoint + " days")
                }
                if (level == "Assay.Timepoint") {
                    const assay = m.split(/\./)[0]
                    const timepoint = m.split(/\./)[1]
                    return (assay + " at " + timepoint + " days")
                }
                if (level == "SampleType.Assay") {
                    const assay = m.split(/\./)[1]
                    const sampleType = m.split(/\./)[0]
                    return (assay + " (" + sampleType + ")")
                }
                if (level == "Timepoint") {
                    return "Day " + m
                }
                return(m)
            }
            const textArray = e.get("members").map((m) => getText(m, i))
            return(textArray.join(" " + e.get("operator") + " "))
        })

        filterFlags = filterText.map((text, i) => {
            if (text == undefined) return (undefined)
            return (
                <Flag dim="Data" >
                    <b>{prefixes[i]}</b>{text}
                </Flag>
            )
        }).valueSeq()
    }


    return (
        <div>
            {title && <h4>{title}</h4>}
            {filterFlags}
        </div>
    )
}

const FilterIndicatorList: React.FC<FilterIndicatorListProps> = ({ filterClass, filters, title }) => {
    // props: filter class, filters, title text
    let filterFlags
    // debugger;
    if (filters.size == 0) {
        filterFlags = <em className="filter-indicator">No filters currently applied</em>
    } else {
        const filterKeys = filters.keySeq();
        filterFlags = filterKeys.map((key: string) => {
            return (<FilterIndicatorFlag key={filters.getIn([key, "members"])} dim={filterClass} filter={filters.get(key)} level={key} />)
        })
    }
    return (
        <div>
            <h4>{title}</h4>
            {filterFlags}
        </div>
    )
}
interface FlagProps {
    dim: string;
    onDelete?: () => void;
}
export const Flag: React.FC<FlagProps> = ({ dim, onDelete, children }) => {
    return (
        <div className="filter-indicator">
            <div className={"filter-indicator-text " + dim} style={onDelete && {maxWidth: "10em"}}>
                {children}
            </div>
            {onDelete &&
                <button className="filterdeletor" onClick={onDelete}>
                    <span className="glyphicon glyphicon-remove">X</span>
                </button>}
        </div>
    )
}
const FilterIndicatorFlag: React.FC<FilterIndicatorFlagProps> = ({ dim, filter, level }) => {
    const text = filter.members.join(" " + filter.operator + " ")

    return (
        <Flag dim={dim}>
            <b>{level}: </b>{text}
        </Flag>
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