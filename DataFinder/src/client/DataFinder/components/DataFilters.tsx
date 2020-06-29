import React from 'react'
import { SelectedFilters, Filter, AssayData, FilterCategories, SelectedFilter } from '../../typings/CubeData'
import { CubeMdx } from '../../typings/Cube'
import { Map, List } from 'immutable'
import { FilterDeletor } from './FilterSummary'
import { getPlotData, createPlotData } from '../helpers/CubeHelpers'
import "./DataFilters.scss"

// Types
export interface DataFilterDropdownsProps {
    mdx: CubeMdx;
    loadedStudiesArray: string[];
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    filterCategories: FilterCategories;
    selectedStudyFilters: Map<string, SelectedFilter>;
    selectedSubjectFilters: Map<string, SelectedFilter>;
}
interface DataFilterSelectorProps {
    mdx: CubeMdx;
    loadedStudiesArray: string[];
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    toggleAndOr: (dim: string, level: string, which: string) => void;
    filterCategories: FilterCategories;
}
interface DataFilterDropdownProps {
    selected: boolean;
    title: string;
    dropdownOptions: string[];
    select: (option: string) => void;
    allText: string;
}

interface DataFilterDropdownButtonProps {
    title: string;
    labelClass?: string;
    selected?: boolean;
}

interface AndOrDropdownProps {
    status: string;
    onClick: (value: string) => void;
}

interface DataFilterIndicatorsProps {
    selectedDataFilters: Map<string, Map<string, SelectedFilter>>;
    toggleAndOr: (dim: string, level: string, which: string) => void;
    filterClick: (dim: string, filter: Filter) => () =>  void;
}

interface DataFilterIndicatorProps {
    filterInfo: {
        level: string;
        members: List<string>;
        operator: string;
    };
    toggleAndOr: (dim: string, level: string, which: string) => void;
    filterClick: (dim: string, filter: Filter) => () =>  void;
}

interface DataFilterDeletorsProps {
    size: string;
}


// Component
export const DataFilters: React.FC<DataFilterSelectorProps> = ({mdx, loadedStudiesArray, selectedFilters, filterClick, filterCategories, toggleAndOr}) => {
    return (
        <div className="df-assay-data-selector">
            <DataFilterDropdowns 
                mdx={mdx}
                loadedStudiesArray={loadedStudiesArray}
                selectedFilters={selectedFilters} 
                filterClick={filterClick} 
                filterCategories={filterCategories}
                selectedStudyFilters={selectedFilters.get("Study")}
                selectedSubjectFilters={selectedFilters.get("Subject")}/>
            <DataFilterIndicators
                selectedDataFilters={selectedFilters.get("Data")}
                toggleAndOr={toggleAndOr}
                filterClick={filterClick}/>
        </div>
    )
}

// Sub-components -------- 

// For styling
const DataFilterRow: React.FC = ({children}) => {
    return <div className={"df-data-filter-row"}>
    {React.Children.map(children || null, (child, i) => {
        return (
            <div className="df-data-filter-row-element">
                {child}
            </div>
            )
        })}
    </div>
}

// A group of filter deletors
const DataFilterDeletors: React.FC<DataFilterDeletorsProps> = ({size, children}) => {
    return <div className={"df-data-indicator " + size}>
        {children}
    </div>
}

// Indicators (what shows up once you've added the filter) ----
const DataFilterIndicators: React.FC<DataFilterIndicatorsProps> = ({selectedDataFilters, toggleAndOr, filterClick}) => {
    const flatFilters = [];
    selectedDataFilters.forEach((o, k1) => o.forEach((filter, k2) => {
        if (filter.get("members")) {
            flatFilters.push({
                level: k1 + "." + k2, 
                members: filter.get("members"), 
                operator: filter.get("operator")
            })
        }
    }))

    return <> 
    {flatFilters.map(filterInfo => 
        <DataFilterIndicator 
            filterInfo={filterInfo} 
            toggleAndOr={toggleAndOr}
            filterClick={filterClick}
            key={filterInfo.level}/>
        )}
    </>
}

const DataFilterIndicator: React.FC<DataFilterIndicatorProps> = ({filterInfo, toggleAndOr, filterClick}) => {

    if (filterInfo.level == "Assay.Assay") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        <DataFilterDeletors size={"short"}>
        {filterInfo.members.map(member => {
        return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
            {member}
        </FilterDeletor>
        })}
        </DataFilterDeletors>
        at Any Timepoint for Any Sample Type
        </DataFilterRow>
    } else if (filterInfo.level == "Timepoint.Timepoint") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at 
        <DataFilterDeletors size={"short"}>
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {"Day " + member}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
        for Any Sample Type
         </DataFilterRow>
    } else if (filterInfo.level == "SampleType.SampleType") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at Any Timepoint for 
        <DataFilterDeletors size={"short"}>
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {member}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
         </DataFilterRow>
    } else if (filterInfo.level == "Assay.Timepoint") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        <DataFilterDeletors size={"long"}>
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {member.replace("\.", " at Day ")}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
        for Any Sample Type
         </DataFilterRow>
    } else if (filterInfo.level == "SampleType.Assay") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        <DataFilterDeletors size={"long"}>
        {filterInfo.members.map(member => {
            const memberSplit = member.split("\.")
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {memberSplit[1] + " for " + memberSplit[0]}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
        at Any Timepoint
        </DataFilterRow>
    } else if (filterInfo.level == "Timepoint.SampleType") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at 
        <DataFilterDeletors size={"long"}>
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {" Day " + member.replace("\.", " for ")}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
        </DataFilterRow>
    } else if (filterInfo.level == "Assay.SampleType") {
        return <DataFilterRow>
        <AndOrDropdown status={filterInfo.operator} onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        <DataFilterDeletors size={"longest"}>
        {filterInfo.members.map(member => {
            const memberSplit = member.split("\.")
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {memberSplit[0] + " at Day " + memberSplit[1] + " for " + memberSplit[2]}
            </FilterDeletor>
        }        
        )}
        </DataFilterDeletors>
        </DataFilterRow>
    }
    
}


// ----- Dropdowns -----
const DataFilterDropdowns: React.FC<DataFilterDropdownsProps> = ({mdx, loadedStudiesArray, selectedStudyFilters, selectedSubjectFilters, filterClick, filterCategories}) => {
    const [currentFilter, setCurrentFilter] = React.useState<Map<string, string>>(Map<string, string>())
    const [dropdownOptions, setDropdownOptions] = React.useState<Map<string, string[]>>(Map<string, string[]>())
    const [assayData, setAssayData] = React.useState<AssayData>(new AssayData())
    
    React.useEffect(() => {
        const selectedFilters = new SelectedFilters({Study: selectedStudyFilters.toJS(), Subject: selectedSubjectFilters.toJS()})
        getPlotData(mdx, selectedFilters, "[Subject].[Subject]", loadedStudiesArray, false).then((pd) => {
            const plotData = createPlotData(pd, null)
            const newAssayData = plotData.Data
            const newDropdownOptions = updateDropdownOptions(currentFilter, newAssayData, filterCategories)
            setAssayData(newAssayData)
            setDropdownOptions((prevDropdownOptions) => prevDropdownOptions.merge(newDropdownOptions))
        })
        
    }, [selectedStudyFilters, selectedSubjectFilters])
    
    const selectFilter = (hierarchy: string, stripText?: string | RegExp) => {
        stripText = stripText ?? ""
        return (option: string) => {
            option = option?.replace(stripText, "")
            const newFilter = currentFilter.set(hierarchy, option)
            const newDropdownOptions = updateDropdownOptions(newFilter, assayData, filterCategories)
            setDropdownOptions((prevDropdownOptions) => prevDropdownOptions.merge(newDropdownOptions))
            setCurrentFilter(newFilter)
        }
    }

    const addFilter = () => {
        filterClick("Data", createFilter(currentFilter))();
        setCurrentFilter(Map<string, string>())
        setDropdownOptions(Map(updateDropdownOptions(Map(), assayData, filterCategories)))
    }
    
    return <DataFilterRow>
        <DataFilterDropdown
            selected={!!currentFilter.get("Assay")}
            title={currentFilter.get("Assay") ?? "Any Assay"}
            dropdownOptions={dropdownOptions.get("Assay")} 
            select={selectFilter("Assay")}
            allText="Any Assay"/>
        <span>at</span>
        <DataFilterDropdown 
            selected={!!currentFilter.get("Timepoint")}
            title={currentFilter.get("Timepoint") ? ("Day " + currentFilter.get("Timepoint")) : "Any Timepoint"}
            dropdownOptions={dropdownOptions.get("Timepoint")} 
            select={selectFilter("Timepoint", "Day ")}
            allText="Any Timepoint" />
        <span>for</span>
        <DataFilterDropdown
            selected={!!currentFilter.get("SampleType")}
            title={currentFilter.get("SampleType") ?? "Any Sample Type"}
            dropdownOptions={dropdownOptions.get("SampleType")} 
            select={selectFilter("SampleType")}
            allText="Any Sample Type"/>
        <button 
            onClick={() => {addFilter()}}
            disabled={!currentFilter.get("Assay") && !currentFilter.get("Timepoint") && !currentFilter.get("SampleType")}>
                <i className="fa fa-plus"></i>
            </button>
    </DataFilterRow>
}

const DataFilterDropdownButton : React.FC<DataFilterDropdownButtonProps> = ({title, labelClass, children, selected}) => {
    return <div className={"dropdown df-filter-dropdown assay-data-dropdown " + (selected ? "selected": "")}>
        <div className={"btn"} role="group" >
            <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" >
                <span className={labelClass} style={{ float: "left"}}>{title}</span>
                <span style={{ float: "right" }}><i className="fa fa-caret-down"></i></span>
            </button>
            {children}
        </div>
    </div>
}

const DataFilterDropdown : React.FC<DataFilterDropdownProps> = ({title, dropdownOptions, select, allText, selected}) => {

    return <DataFilterDropdownButton title={title} labelClass="assay-data-dropdown-label" selected={selected}>
        <ul className="dropdown-menu df-dropdown">
            <li key={"all"} className={"df-dropdown-option"}>
                <a style={{ padding: "0px 5px" }} onClick={() => select(undefined)}>
                    {allText}
                </a>
            </li>
            {dropdownOptions?.map((option) => {
                return (
                    <li key={option} className={"df-dropdown-option"}>

                        <a style={{ padding: "0px 5px" }} onClick={() => select(option)}>
                            {option}
                        </a>
                    </li>
                )
            })}
        </ul>
    </DataFilterDropdownButton>
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
       <DataFilterDropdownButton title={title}>
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
       </DataFilterDropdownButton>
                
    )
}




// helpers -----------------

const updateDropdownOptions = (currentFilter, assayData, filterCategories: FilterCategories) => {
    const currentAssay = currentFilter.get("Assay")
    const currentTimepoint = currentFilter.get("Timepoint")
    const currentSampleType = currentFilter.get("SampleType")

    let assayArray, timepointArray, sampleTypeArray
    if (!currentAssay && !currentTimepoint && !currentSampleType) {
        assayArray = assayData.getIn(["Assay", "Assay"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
            .filter(x => x)
        // assay = [...new Set(assayArray)].filter(x => x) // get unique values and remove null
        timepointArray = assayData.getIn(["Timepoint", "Timepoint"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        // timepoint = [...new Set(timpeointArray)].filter(x => x)
        sampleTypeArray = assayData.getIn(["SampleType", "SampleType"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        // sampleType = [...new Set(sampleTypeArray)].filter(x => x)
    }
    if (currentAssay && !currentTimepoint && !currentSampleType) {
        assayArray = assayData.getIn(["Assay", "Assay"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        // assay = [...new Set(assayArray)].filter(x => x) // get unique values and remove null
        timepointArray = assayData.getIn(["Assay","Timepoint"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/^.+\./, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/\..+/, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && currentTimepoint && !currentSampleType) {
        assayArray = assayData.getIn(["Assay", "Timepoint"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Timepoint", "Timepoint"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        // timepoint = [...new Set(timpeointArray)].filter(x => x)
        sampleTypeArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && !currentTimepoint && currentSampleType) {
        assayArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["SampleType", "SampleType"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        // sampleType = [...new Set(sampleTypeArray)].filter(x => x)
    }
    if (currentAssay && currentTimepoint && !currentSampleType) {
        assayArray = assayData.getIn(["Assay", "Timepoint"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Assay","Timepoint"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/^.+\./, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\." + currentTimepoint))
            .map(f => f.member.replace(/.+\..+\./, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    if (currentAssay && !currentTimepoint && currentSampleType) {
        assayArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\..+\." + currentSampleType))
            .map(f => f.member.replace(/^[^\.]+\./, "").replace(/\..+/, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/\..+/, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && currentTimepoint && currentSampleType) {
        assayArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint + "\." + currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    if (currentAssay && currentTimepoint && currentSampleType) {
        assayArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint + "\." + currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        // assay = [...new Set(assayArray)]
        timepointArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\..+\." + currentSampleType))
            .map(f => f.member.replace(/^[^\.]+\./, "").replace(/\..+/, ""))
        // timepoint = [...new Set(timepointArray)]
        sampleTypeArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\." + currentTimepoint))
            .map(f => f.member.replace(/.+\..+\./, ""))
        // sampleType = [...new Set(sampleTypeArray)]
    }
    const assay = filterCategories.Assay.filter(fc => assayArray.indexOf(fc.label) > -1).map(fc => fc.label)
    const timepoint = filterCategories.Timepoint.filter(fc => timepointArray.indexOf(fc.label) > -1).map(fc => "Day " + fc.label)
    const sampleType = filterCategories.SampleType.filter(fc => sampleTypeArray.indexOf(fc.label) > -1).map(fc => fc.label)
    return {Assay: assay, Timepoint: timepoint, SampleType: sampleType}
}

const createFilter = (currentFilter) => {
    if (!currentFilter.get("Assay") && !currentFilter.get("Timepoint") ) return(
        {level: "SampleType.SampleType", member: currentFilter.get("SampleType")}
    )
    if (!currentFilter.get("Assay") && !currentFilter.get("SampleType")) return(
        {level: "Timepoint.Timepoint", member: currentFilter.get("Timepoint")}
    )
    if (!currentFilter.get("Timepoint") && !currentFilter.get("SampleType")) return(
        {level: "Assay.Assay", member: currentFilter.get("Assay")}
    )
    if (!currentFilter.get("Assay")) return(
        {level: "Timepoint.SampleType", member: currentFilter.get("Timepoint") + "." + currentFilter.get("SampleType")}
    )
    if (!currentFilter.get("Timepoint")) return(
        {level: "SampleType.Assay", member: currentFilter.get("SampleType") + "." + currentFilter.get("Assay")}
    )
    if (!currentFilter.get("SampleType")) return(
        {level: "Assay.Timepoint", member: currentFilter.get("Assay") + "." + currentFilter.get("Timepoint")}
    )
    return(
        {level: "Assay.SampleType", member: currentFilter.get("Assay") + "." + currentFilter.get("Timepoint") + "." + currentFilter.get("SampleType")}
    )
}
