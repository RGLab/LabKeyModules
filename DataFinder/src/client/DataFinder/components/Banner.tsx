import React from 'react'
import { FilterSummary } from './FilterIndicator'
import { ISelectedFilters, SelectedFilters, GroupInfo, TotalCounts } from '../../typings/CubeData';

interface BannerProps {
    filters: SelectedFilters,
    groupInfo: GroupInfo,
    counts: TotalCounts
}

export const Banner: React.FC<BannerProps> = ({filters, groupInfo, counts}) => {
    const groupLabel = groupInfo ? groupInfo.label : "Unsaved Participant Group"
    return(
        <>
            <div className="row">
                <div className="col-sm-8">
                    <h3>{groupLabel}</h3>
                    <div>{counts.participant} participants from {counts.study} studies</div>
                </div>
            </div>
            <FilterSummary filters={filters}/>
        </>
    )
}