import * as React from 'react';
import { Filter, FilterCategory, SelectedFilter, FilterCategories, AssayData, SelectedFilters } from '../../typings/CubeData'
import { List} from 'immutable'
import { Flag, FilterDeletor } from './FilterIndicator'
import { HeatmapSelectorDropdown } from './HeatmapSelector';
import { FilterDropdownButton, OuterDropdownButton } from './ActionButton'

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

interface ContentDropdownProps {
    id: string
    label: string;
    content?: JSX.Element;
    customMenuClass?: string;
    disabled?: boolean
}

interface AndOrDropdownProps {
    status?: string;
    onClick: (value: string) => void;
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



export const AndOrDropdown: React.FC<AndOrDropdownProps> = ({ status, onClick }) => {
    if (status === undefined) status = "OR"
    const statusText = {
        AND: "All of",
        OR: "Any of"
    }

    const buttonData = [
        {
            label: statusText.AND,
            action: () => onClick("AND"),
            disabled: false
        },
        {
            label: statusText.OR,
            action: () => onClick("OR"),
            disabled: false
        }
    ]
    const title = statusText[status]
    return (
        <FilterDropdownButton title={title}>
            <ul className="dropdown-menu">
                    {buttonData.map((button) => {
                        return (
                            <li className={button.disabled ? "disabled" : ""}>
                                <a key={button.label} onClick={button.action}>
                                    {button.label}
                                </a>
                            </li>
                        )
                    })}
            </ul>
        </FilterDropdownButton>
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
    includeAndOr, 
    andOrClick,
}) => {
    if (includeIndicators === undefined) includeIndicators = true;
    if (includeAndOr === undefined) includeAndOr = false;
    

    return(
        <>
            {includeAndOr &&
                <AndOrDropdown status={levelSelectedFilters?.get("operator") ?? "OR"}
                    onClick={andOrClick} />
            }
            
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
        {/* <FilterSelector 
            dim="Study" 
            level="ExposureMaterial" 
            label="Exposure Material" 
            levelSelectedFilters={studySelectedFilters.get("ExposureMaterial")}
            levelFilterCategories={filterCategories.ExposureMaterial}
            filterClick={filterClick}/> */}
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
        {/* <FilterSelector 
            dim="Study" 
            level="ExposureProcess" 
            label="Exposure Process" 
            levelSelectedFilters={studySelectedFilters.get("ExposureProcess")}
            levelFilterCategories={filterCategories.ExposureProcess}
            filterClick={filterClick}/> */}
        {/* <FilterSelector 
            dim="Study" 
            level="Species" 
            label="Species" 
            levelSelectedFilters={studySelectedFilters.get("Species")}
            levelFilterCategories={filterCategories.Species}
            filterClick={filterClick}/> */}
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

export const AssayFilters: React.FC<AssayFiltersProps> = ({assaySelectedFilters, filterCategories, filterClick, toggleAndOr, assayPlotData}) => {
    return <>
    {/* <FilterSelector
        dim="Data"
        level="Assay.Assay"
        label="Assay"
        levelSelectedFilters={assaySelectedFilters.getIn(["Assay", "Assay"])}
        levelFilterCategories={filterCategories.Assay}
        filterClick={filterClick}
        includeAndOr={true}
        andOrClick={(value) => toggleAndOr("Data", "Assay.Assay", value)}/>

    <FilterSelector
        dim="Data"
        level="SampleType.SampleType"
        label="Sample Type"
        levelSelectedFilters={assaySelectedFilters.getIn(["SampleType", "SampleType"])}
        levelFilterCategories={filterCategories.SampleType}
        filterClick={filterClick}
        includeAndOr={true}
        andOrClick={(value) => toggleAndOr("Data", "SampleType.SampleType", value)}/>
    {filterCategories.SampleTypeAssay && assayPlotData && 
        <HeatmapSelectorDropdown
            data={assayPlotData} 
            filterClick={filterClick} 
            selectedDataFilters={assaySelectedFilters}
            timepointCategories={filterCategories.Timepoint}
            sampleTypeAssayCategories={filterCategories.SampleTypeAssay}
            toggleAndOr={toggleAndOr}/>
    } */}
    <div className={"df-assay-data-selector"}></div>
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
    assayPlotData
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
            <AssayFilters
                assaySelectedFilters={selectedFilters.get("Data")}
                filterCategories={filterCategories}
                filterClick={filterClick}
                toggleAndOr={toggleAndOr}
                assayPlotData={assayPlotData}/>
    </div>
}
export const DataFinderFilters = React.memo(DataFinderFiltersFC)

export const RowOfButtons: React.FC = ({children}) => {
    return <div className={"df-row-of-buttons"}>
    {React.Children.map(children || null, (child, i) => {
        return (
            <div style={{float: "left", padding: "3px 10px"}}>
                {child}
            </div>
            )
        })}
    </div>
}