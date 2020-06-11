import React from 'react'
import { SelectedFilters, Filter, AssayData } from '../../typings/CubeData'
import { CubeMdx } from '../../typings/Cube'
import { RowOfButtons } from './FilterDropdown'
import { DropdownButtons, FilterDropdownButton } from './ActionButton'
import { Map } from 'immutable'

interface DataFilterDropdownsProps {
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    assayData: AssayData;
}

interface DataFilterSelectorProps {
    selectedFilters: SelectedFilters;
    filterClick: (dim: string, filter: Filter) => () =>  void;
    assayData: AssayData;
    toggleAndOr: (dim: string, level: string, which: string) => void;
}
interface DataFilterDropdownContentProps {
    title: string;
    dropdownOptions: string[];
    select: (option: string) => void;
    allText: string;
}

const DataFilterDropdowns: React.FC<DataFilterDropdownsProps> = ({selectedFilters, assayData, filterClick}) => {
    const [currentFilter, setCurrentFilter] = React.useState<Map<string, string>>(Map<string, string>())
    const [dropdownOptions, setDropdownOptions] = React.useState<Map<string, string[]>>(Map<string, string[]>())
    
    React.useEffect(() => {
        const newDropdownOptions = updateDropdownOptions(currentFilter, assayData)
        setDropdownOptions((prevDropdownOptions) => prevDropdownOptions.merge(newDropdownOptions))
    }, [assayData])
    
    const selectFilter = (hierarchy: string) => {
        return (option: string) => {
            const newFilter = currentFilter.set(hierarchy, option)
            const newDropdownOptions = updateDropdownOptions(newFilter, assayData)
            setDropdownOptions((prevDropdownOptions) => prevDropdownOptions.merge(newDropdownOptions))
            setCurrentFilter(newFilter)
        }
    }

    const addFilter = () => {
        filterClick("Data", createFilter(currentFilter))();
        setCurrentFilter(Map<string, string>())
        setDropdownOptions(Map(updateDropdownOptions(Map(), assayData)))
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



export const DataFilterSelector: React.FC<DataFilterSelectorProps> = ({selectedFilters, assayData, filterClick}) => {
    return (
        <div className="df-assay-data-selector">
            <DataFilterDropdowns selectedFilters={selectedFilters} assayData={assayData} filterClick={filterClick}/>
        </div>
    )
}


// helpers
const updateDropdownOptions = (currentFilter, assayData) => {
    const currentAssay = currentFilter.get("Assay")
    const currentTimepoint = currentFilter.get("Timepoint")
    const currentSampleType = currentFilter.get("SampleType")

    let assay, timepoint, sampleType;
    if (!currentAssay && !currentTimepoint && !currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "Assay"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        assay = [...new Set(assayArray)].filter(x => x) // get unique values and remove null
        const timpeointArray = assayData.getIn(["Timepoint", "Timepoint"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        timepoint = [...new Set(timpeointArray)].filter(x => x)
        const sampleTypeArray = assayData.getIn(["SampleType", "SampleType"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        sampleType = [...new Set(sampleTypeArray)].filter(x => x)
    }
    if (currentAssay && !currentTimepoint && !currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "Assay"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        assay = [...new Set(assayArray)].filter(x => x) // get unique values and remove null
        const timepointArray = assayData.getIn(["Assay","Timepoint"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/^.+\./, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/\..+/, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && currentTimepoint && !currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "Timepoint"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        assay = [...new Set(assayArray)]
        const timpeointArray = assayData.getIn(["Timepoint", "Timepoint"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        timepoint = [...new Set(timpeointArray)].filter(x => x)
        const sampleTypeArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && !currentTimepoint && currentSampleType) {
        const assayArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        assay = [...new Set(assayArray)]
        const timepointArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["SampleType", "SampleType"])
            .map(m => m.get("participantCount") ? m.get("member") : null).toJS()
        sampleType = [...new Set(sampleTypeArray)].filter(x => x)
    }
    if (currentAssay && currentTimepoint && !currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "Timepoint"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        assay = [...new Set(assayArray)]
        const timepointArray = assayData.getIn(["Assay","Timepoint"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/^.+\./, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\." + currentTimepoint))
            .map(f => f.member.replace(/.+\..+\./, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    if (currentAssay && !currentTimepoint && currentSampleType) {
        const assayArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        assay = [...new Set(assayArray)]
        const timepointArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\..+\." + currentSampleType))
            .map(f => f.member.replace(/^[^\.]+\./, "").replace(/\..+/, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["SampleType", "Assay"]).toJS()
            .filter(f => f.member.match(currentAssay) && f.participantCount )
            .map(f => f.member.replace(/\..+/, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    if (!currentAssay && currentTimepoint && currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint + "\." + currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        assay = [...new Set(assayArray)]
        const timepointArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["Timepoint", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint) && f.participantCount)
            .map(f => f.member.replace(/.+\./, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    if (currentAssay && currentTimepoint && currentSampleType) {
        const assayArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentTimepoint + "\." + currentSampleType) && f.participantCount)
            .map(f => f.member.replace(/\..+/, ""))
        assay = [...new Set(assayArray)]
        const timepointArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\..+\." + currentSampleType))
            .map(f => f.member.replace(/^[^\.]+\./, "").replace(/\..+/, ""))
        timepoint = [...new Set(timepointArray)]
        const sampleTypeArray = assayData.getIn(["Assay", "SampleType"]).toJS()
            .filter(f => f.member.match(currentAssay + "\." + currentTimepoint))
            .map(f => f.member.replace(/.+\..+\./, ""))
        sampleType = [...new Set(sampleTypeArray)]
    }
    return {Assay: assay, Timepoint: timepoint, SampleType: sampleType}
}

const createFilter = (currentFilter) => {
    if (!currentFilter.get("Assay") && !currentFilter.get("Timepoint") ) return(
        {level: "SampleType.SampleType", member: currentFilter.get("Assay")}
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
