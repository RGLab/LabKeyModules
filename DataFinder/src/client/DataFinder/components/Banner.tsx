import React from 'react'
import { FilterSummary } from './FilterIndicator'
import { ISelectedFilters, SelectedFilters, GroupInfo, TotalCounts } from '../../typings/CubeData';

interface BannerProps {
    filters: SelectedFilters,
    groupInfo: GroupInfo,
    counts: TotalCounts,
    unsavedFilters: boolean
}

export const Banner: React.FC<BannerProps> = ({filters, groupInfo, counts, unsavedFilters}) => {
    const groupLabel = groupInfo ? groupInfo.label : "Unsaved Participant Group"
    return(
        <>
            <div className="row">
                <div className="col-sm-8">
                    <h3>{groupLabel}</h3>
                    {unsavedFilters && <>
                        <p style={{color: "red"}}>Click "Update" to save changes</p>
                    </>}
                    <p>{counts.participant} participants from {counts.study} studies</p>
                </div>
            </div>
            <FilterSummary filters={filters}/>
        </>
    )
}