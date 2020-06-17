import * as React from 'react';
import { Filter, FilterCategory, SelectedFilter, FilterCategories, AssayData, SelectedFilters } from '../../typings/CubeData'
import { List} from 'immutable'
import { Flag, FilterDeletor } from './FilterIndicator'
import { OuterDropdownButtonProps } from './reusable/Dropdowns'
import { DataFilterSelector } from './DataFilterSelector';
import { CubeMdx } from '../../typings/Cube';

// Types 
export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: FilterCategory[];
    filterClick: (dim: string, filter: Filter) => () => void;
    selected: List<string>;
    label?: string;
}

interface FilterSelectorProps {
    dim: string ;
    level: string;
    label: string;
    levelSelectedFilters: SelectedFilter;
    levelFilterCategories: FilterCategory[];
    filterClick: (dim: string, filter: Filter) => () => void;
    includeIndicators?: boolean;
    includeAndOr?: boolean;
    andOrClick?: (value: string) => void;
}

interface StudyFiltersProps {
    studySelectedFilters: Map<string, SelectedFilter>;
    filterCategories: FilterCategories;
    filterClick: (dim: string, filter: Filter) => () => void;
}

interface SubjectFiltersProps {
    subjectSelectedFilters: Map<string, SelectedFilter>;
    filterCategories: FilterCategories;
    filterClick: (dim: string, filter: Filter) => () => void;
}

interface AssayFiltersProps {
    assaySelectedFilters: any;
    filterCategories: FilterCategories;
    filterClick: (dim: string, filter: Filter) => () => void;
    toggleAndOr: (dim: string, level: string, which: string) => void;
    assayPlotData: AssayData;
}

interface DataFinderFilterProps {
    selectedFilters: SelectedFilters;
    filterCategories: FilterCategories;
    filterClick: (dim: string, filter: Filter) => () => void;
    toggleAndOr: (dim: string, level: string, which: string) => void;
    assayPlotData: AssayData;
    mdx: CubeMdx;
    loadedStudiesArray: string[];
}



export const FilterDropdownButton: React.FC<OuterDropdownButtonProps> = ({title, disabled, children}) => {
    const openRef = React.useRef<HTMLDivElement>(null)
    const open = () => {
        const cl = openRef.current.classList
        const willOpen = !cl.contains("open")
        for (let el of document.querySelectorAll(".df-filter-dropdown>.open")) {
            console.log("close!")
            el.classList.remove("open")
        };
        if (willOpen) {
            console.log("open!")
            cl.add("open")
        }
    }
    return (
        <div className="dropdown df-filter-dropdown">
            <div className={"btn"} ref={openRef} role="group" >
                <button className="btn btn-default dropdown-toggle" type="button" disabled={disabled} onClick={open}>
                    <span style={{float: "left"}}>{title}</span>
                    <span style={{float: "right"}}><i className="fa fa-caret-down"></i></span>
                </button>
                {children}
            </div>
        </div>
    )
}

export const FilterDropdownContent: React.FC<FilterDropdownProps> = 
({ 
        dimension, 
        level, 
        members, 
        filterClick, 
        selected
    }) => {

    const labels = members.map(m => m.label)
    return(
        <div className="dropdown-menu filter-menu">
            <div id={level} className="form-group">
                {labels.map((e) => {
                    let checked: boolean;
                    if (selected == undefined) {
                        checked = false
                    } else if (selected.includes(e)) {
                        checked = true;
                    } else {
                        checked = false;
                    }

                    return (
                        <div className="checkbox" key={e}>
                            <label >
                                <input
                                    onClick={filterClick(dimension, { level: level, member: e })}
                                    type="checkbox"
                                    name={level}
                                    value={e}
                                    checked={checked}
                                    readOnly />
                                <span>{e}</span>
                            </label>
                        </div>
                    )
                })}
            </div>
        </div>

    )
}

const FilterSelectorFC: React.FC<FilterSelectorProps> = ({
    dim, 
    level, 
    label,
    filterClick, 
    levelSelectedFilters,
    levelFilterCategories,

    includeIndicators, 
}) => {
    if (includeIndicators === undefined) includeIndicators = true;
    

    return(
        <>
            
            <FilterDropdownButton title={label}>
                <FilterDropdownContent
                    dimension={dim}
                    level={level}
                    members={levelFilterCategories}
                    filterClick={filterClick}
                    selected={levelSelectedFilters?.get("members")}
                />
                {includeIndicators &&
                    levelSelectedFilters &&
                    <div className="filter-indicator-list">
                        {levelSelectedFilters?.get("members").map((member) => {
                            return (
                                <FilterDeletor dim={dim}
                                    onDelete={filterClick(dim, { level: level, member: member })} >
                                    {member}
                                </FilterDeletor>
                            )
                        })}
                    </div>
                }
            </FilterDropdownButton>
        </>
    )
    
}
export const FilterSelector = React.memo(FilterSelectorFC)

export const StudyFilters: React.FC<StudyFiltersProps> = ({studySelectedFilters, filterCategories, filterClick}) => {
    
    return <>
        <FilterSelector 
            dim="Study" 
            level="Condition" 
            label="Condition" 
            levelSelectedFilters={studySelectedFilters.get("Condition")}
            levelFilterCategories={filterCategories.Condition}
            filterClick={filterClick}/>
        <FilterSelector
            dim="Study"
            level="ResearchFocus"
            label="Research Focus"
            levelSelectedFilters={studySelectedFilters.get("ResearchFocus")}
            levelFilterCategories={filterCategories.ResearchFocus}
            filterClick={filterClick}/>
        <FilterSelector 
            dim="Study" 
            level="Study" 
            label="Study" 
            levelSelectedFilters={studySelectedFilters.get("Study")}
            levelFilterCategories={filterCategories.Study}
            filterClick={filterClick}/>
    </>
}

export const SubjectFilters: React.FC<SubjectFiltersProps> = ({subjectSelectedFilters, filterCategories, filterClick}) => {
    return <>
    <FilterSelector
        dim="Subject"
        level="Gender"
        label="Gender"
        levelSelectedFilters={subjectSelectedFilters.get("Gender")}
        levelFilterCategories={filterCategories.Gender}
        filterClick={filterClick}/>
    <FilterSelector
        dim="Subject"
        level="Age"
        label="Age"
        levelSelectedFilters={subjectSelectedFilters.get("Age")}
        levelFilterCategories={filterCategories.Age}
        filterClick={filterClick}/>
    <FilterSelector
        dim="Subject"
        level="Race"
        label="Race"
        levelSelectedFilters={subjectSelectedFilters.get("Race")}
        levelFilterCategories={filterCategories.Race}
        filterClick={filterClick}/>

    </>
}

const FilterSet : React.FC = (({children}) => {
    return(
        <div className={"filter-dropdown-set"}>
            {children}
        </div>
    )
})

const DataFinderFiltersFC: React.FC<DataFinderFilterProps> = ({
    selectedFilters,
    filterCategories,
    filterClick,
    toggleAndOr,
    loadedStudiesArray,
    mdx

}) => {
    return <div style={{display: "flex"}}>
        <FilterSet>
            <StudyFilters 
                studySelectedFilters={selectedFilters.get("Study")}
                filterCategories={filterCategories}
                filterClick={filterClick}/>
        </FilterSet>
        <FilterSet>
            <SubjectFilters
                subjectSelectedFilters={selectedFilters.get("Subject")}
                filterClick={filterClick}
                filterCategories={filterCategories}/>
        </FilterSet>
            <DataFilterSelector
                mdx={mdx}
                loadedStudiesArray={loadedStudiesArray}
                selectedFilters={selectedFilters}
                filterClick={filterClick}
                toggleAndOr={toggleAndOr}
                filterCategories={filterCategories}/>
    </div>
}
export const DataFinderFilters = React.memo(DataFinderFiltersFC)
