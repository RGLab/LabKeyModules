import * as React from 'react';

// These are the members of each class of filters: 
// Used for parsing filters from localStorage
export const filterMembers = {
    "study": ["Study", "Species", "Condition", "ExposureMaterial", "ExposureProcess", "ResearchFocus"],
    "participant": ["Gender", "Race", "Age"],
    "sample": ["Assay", "SampleType", "Timepoint"]
}


// Filter stuff... ========================================================


function FilterIndicatorFlag(props: FlagProps) {
    // props: filter class, filter
    let text = ""
    props.filter.members.forEach((e, i, a) => {
        text = text + getFilter(e);
        if (i < a.length - 1) text = text + " " + props.filter.operator + " ";
    });
    return (
        <div className="filter-indicator">
            <div className={"filter-indicator-text " + props.filterClass}>
                <b>{props.filter.name}: </b>{text}
            </div>
        </div>
    )
}

function FilterIndicatorList(props: ListProps) {
    let filterFlags: JSX.Element[];
    if (props.filters.length == 0) {
        filterFlags = [<em className="filter-indicator">No Filters Applied</em>];
    } else {
        filterFlags = props.filters.map((filter) =>
            <FilterIndicatorFlag key={filter.name} filterClass={props.filterClass} filter={filter} />
        )
    }
    return (
        <div>
            <h4>{props.title}</h4>
            {filterFlags}
        </div>
    )
}

function getFilter(filter: string) {
    const re = /\[[^\[\]]+\]$/;
    return filter.match(re);
}

export function AppliedFilters(props: AppliedFilterProps) {

    return (
        <div>
            <FilterIndicatorList
                key="study"
                filterClass={"study"}
                filters={props.filters.study}
                title={"Study Design"} />
            <FilterIndicatorList
                key="participant"
                filterClass={"participant"}
                filters={props.filters.participant}
                title={"Participant Characteristics"} />
            <FilterIndicatorList
                key="sample"
                filterClass={"sample"}
                filters={props.filters.sample}
                title={"Available Data"} />
        </div>
    )
}