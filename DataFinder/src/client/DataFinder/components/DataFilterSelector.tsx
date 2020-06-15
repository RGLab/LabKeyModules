import React from 'react'
import { SelectedFilters, Filter, AssayData, FilterCategories, SelectedFilter } from '../../typings/CubeData'
import { CubeMdx } from '../../typings/Cube'
import { RowOfButtons } from './FilterDropdown'
import { FilterDropdownButton } from './ActionButton'
import { Map, List } from 'immutable'
import { FilterDeletor } from './FilterIndicator'

interface DataFilterDropdownsProps {
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    assayData: AssayData;
    filterCategories: FilterCategories;
}
interface DataFilterSelectorProps {
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    assayData: AssayData;
    toggleAndOr: (dim: string, level: string, which: string) => void;
    filterCategories: FilterCategories;
}
interface DataFilterDropdownContentProps {
    title: string;
    dropdownOptions: string[];
    select: (option: string) => void;
    allText: string;
}

interface AndOrDropdownProps {
    status?: string;
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

export const DataFilterSelector: React.FC<DataFilterSelectorProps> = ({selectedFilters, assayData, filterClick, filterCategories, toggleAndOr}) => {
    return (
        <div className="df-assay-data-selector">
            <DataFilterDropdowns 
                selectedFilters={selectedFilters} 
                assayData={assayData} 
                filterClick={filterClick} 
                filterCategories={filterCategories}/>
            <DataFilterIndicators
                selectedDataFilters={selectedFilters.get("Data")}
                toggleAndOr={toggleAndOr}
                filterClick={filterClick}/>
        </div>
    )
}

export const DataFilterIndicatorWrapper: React.FC = ({children}) => {
    return <div className={"df-filter-indicator"}>
    {React.Children.map(children || null, (child, i) => {
        return (
            <div style={{float: "left", padding: "3px 10px"}}>
                {child}
            </div>
            )
        })}
    </div>
}

const DataFilterIndicator: React.FC<DataFilterIndicatorProps> = ({filterInfo, toggleAndOr, filterClick}) => {

    if (filterInfo.level == "Assay.Assay") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        {filterInfo.members.map(member => {
        return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
            {member}
        </FilterDeletor>
        })}
        at Any Timepoint for Any Sample Type
        </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "Timepoint.Timepoint") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at 
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {"Day " + member}
            </FilterDeletor>
        }        
        )}
        for Any Sample Type
         </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "SampleType.SampleType") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at Any Timepoint for 
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {member}
            </FilterDeletor>
        }        
        )}
         </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "Assay.Timepoint") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {member.replace("\.", " at Day ")}
            </FilterDeletor>
        }        
        )}
        for Any Sample Type
         </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "SampleType.Assay") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        {filterInfo.members.map(member => {
            const memberSplit = member.split("\.")
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {memberSplit[1] + " for " + memberSplit[0]}
            </FilterDeletor>
        }        
        )}
        at Any Timepoint
        </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "Timepoint.SampleType") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        Any Assay at 
        {filterInfo.members.map(member => {
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {" Day " + member.replace("\.", " for ")}
            </FilterDeletor>
        }        
        )}
        </DataFilterIndicatorWrapper>
    } else if (filterInfo.level == "Assay.SampleType") {
        return <DataFilterIndicatorWrapper>
        <AndOrDropdown onClick={value => toggleAndOr("Data", filterInfo.level, value)}></AndOrDropdown>
        {filterInfo.members.map(member => {
            const memberSplit = member.split("\.")
            return <FilterDeletor dim="Data" onDelete={filterClick("Data", {level: filterInfo.level, member: member})}>
                {memberSplit[0] + " at Day " + memberSplit[1] + " for " + memberSplit[2]}
            </FilterDeletor>
        }        
        )}
        </DataFilterIndicatorWrapper>
    }
    
}

const DataFilterIndicators: React.FC<DataFilterIndicatorsProps> = ({selectedDataFilters, toggleAndOr, filterClick}) => {
    const flatFilters = [];
    selectedDataFilters.forEach((o, k1) => o.forEach((filter, k2) => {
        const all = {k1, filter, k2}
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
    {/* <div className="filter-indicator-list">
          {selectedDataFilters.getIn(["Assay", "Timepoint", "members"])?.map((member) => {
            return (
              < FilterDeletor dim="Data" onDelete={filterClick("Data", { level: "Assay.Timepoint", member: member })} >
                {member.split(".").join(" at ") + " days"}
              </ FilterDeletor>
            )
          })}
        </div>

        <div className="filter-indicator-list">
          {selectedDataFilters.getIn(["Assay", "SampleType", "members"])?.map((member) => {
            const memberSplit = member.split(".")
            return (
              < FilterDeletor dim="Data" onDelete={filterClick("Data", { level: "Assay.SampleType", member: member })} >
                {`${memberSplit[0]} (${memberSplit[2]}) at ${memberSplit[1]} days`}
              </ FilterDeletor>
            )
          })}

        </div> */}
    </>
}

const DataFilterDropdowns: React.FC<DataFilterDropdownsProps> = ({selectedFilters, assayData, filterClick, filterCategories}) => {
    const [currentFilter, setCurrentFilter] = React.useState<Map<string, string>>(Map<string, string>())
    const [dropdownOptions, setDropdownOptions] = React.useState<Map<string, string[]>>(Map<string, string[]>())
    
    React.useEffect(() => {
        const newDropdownOptions = updateDropdownOptions(currentFilter, assayData, filterCategories)
        setDropdownOptions((prevDropdownOptions) => prevDropdownOptions.merge(newDropdownOptions))
    }, [assayData])
    
    const selectFilter = (hierarchy: string) => {
        return (option: string) => {
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
    
    return <RowOfButtons>
        <DataFilterDropdown
            title={currentFilter.get("Assay") ?? "Any Assay"}
            dropdownOptions={dropdownOptions.get("Assay")} 
            select={selectFilter("Assay")}
            allText="Any Assay"/>
        <span>at Day</span>
        <DataFilterDropdown 
            title={currentFilter.get("Timepoint") ?? "Any Timepoint"}
            dropdownOptions={dropdownOptions.get("Timepoint")} 
            select={selectFilter("Timepoint")}
            allText="Any Timepoint" />
        <span>for</span>
        <DataFilterDropdown
            title={currentFilter.get("SampleType") ?? "Any Sample Type"}
            dropdownOptions={dropdownOptions.get("SampleType")} 
            select={selectFilter("SampleType")}
            allText="Any Sample Type"/>
        <button 
            onClick={() => {addFilter()}}
            disabled={!currentFilter.get("Assay") && !currentFilter.get("Timepoint") && !currentFilter.get("SampleType")}>+</button>
    </RowOfButtons>
}

const DataFilterDropdown : React.FC<DataFilterDropdownContentProps> = ({title, dropdownOptions, select, allText}) => {
    return <div className="dropdown df-filter-dropdown assay-data-dropdown">
        <div className={"btn"} role="group" >
            <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" >
                <span style={{ float: "left" }}>{title}</span>
                <span style={{ float: "right" }}><i className="fa fa-caret-down"></i></span>
            </button>
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
        </div>
    </div>
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











// helpers

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
    const timepoint = filterCategories.Timepoint.filter(fc => timepointArray.indexOf(fc.label) > -1).map(fc => fc.label)
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
