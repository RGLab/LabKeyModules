import * as React from 'react';

// Helpers ===============================================================

// Types
interface FlagProps {
    filter: Filter;
    filterClass: string;
}
interface ListProps {
    filterClass: string;
    filters: Array<Filter>;
    title: string;
}
interface AppliedFilterProps {
    filters: GroupedFilters
}


// These are the members of each class of filters: 
// Used for parsing filters from localStorage
export const filterMembers = {
    "study": ["Study", "Species", "Condition", "ExposureMaterial", "ExposureProcess", "ResearchFocus"],
    "participant": ["Gender", "Race", "Age"],
    "sample": ["Assay", "SampleType", "Timepoint"]
}

function getFilter(filter: string) {
    const re = /\[[^\[\]]+\]$/;
    return filter.match(re);
}

// Filter stuff... ========================================================


const FilterIndicatorFlag: React.FC<FlagProps> = (props) => {
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

const FilterIndicatorList: React.FC<ListProps> = (props) => {
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


// Exports ================================================================

export const AppliedFilters: React.FC<AppliedFilterProps> = (props) => {

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