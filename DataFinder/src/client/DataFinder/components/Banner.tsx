import React from 'react'
import { FilterSummary } from './FilterIndicator'
import { ISelectedFilters, SelectedFilters, GroupInfo, TotalCounts } from '../../typings/CubeData';
import { ActionButton } from './ActionButton';

interface BannerProps {
    filters: SelectedFilters,
    groupName: string;
    counts: TotalCounts,
    unsavedFilters: boolean,
}
export const Banner: React.FC<BannerProps> = ({ filters, groupName, counts, unsavedFilters }) => {
    return (
        <>
            <div className="row">
                <div className="col-sm-8">
                    <h3>{groupName}</h3>
                    {unsavedFilters && <>
                        <div style={{ color: "red", display: "inline-block" }}>Changes have not been saved</div>
                        <div style={{ display: "inline-block" }}>
                        </div>
                    </>}
                    <p>{counts.participant} participants from {counts.study} studies</p>
                </div>
            </div>
            <FilterSummary filters={filters} />
        </>
    )
}