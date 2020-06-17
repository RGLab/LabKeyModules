import React from 'react'
import { ISelectedFilters, SelectedFilters, TotalCounts } from '../typings/CubeData';
import { Banner, GroupSummary } from '../DataFinder/components/Banner';
import localStorage from '../DataFinder/helpers/localStorage'
import { DropdownButtons } from '../DataFinder/components/reusable/Dropdowns';
import { getSessionParticipantGroup } from '../DataFinder/helpers/ParticipantGroup_new'


export const FilterBanner = ({ show }) => {
    if (show) {
        const [selectedFilters, setSelectedFilters] = React.useState(new SelectedFilters())
        const [groupSummary, setGroupSummary] = React.useState(new GroupSummary())
        const [counts, setCounts] = React.useState(new TotalCounts)

        React.useEffect(() => {
            getSessionParticipantGroup().then((data) => {
                if (data.filters) {
                    const sf = new SelectedFilters(JSON.parse(data.filters));
                    let newGroupSummary = {};
                    let newCounts = {}
                    const description = JSON.parse(data.description)
                    if (description) {
                        newGroupSummary = description.summary ?? description
                        newCounts = description.counts
                    } else newGroupSummary = {
                        id: data.rowId,
                        label: data.label,
                        isSaved: true
                    }
                    setSelectedFilters(sf)
                    setGroupSummary(prevGroupSummary => prevGroupSummary.with(newGroupSummary))
                    setCounts((prevCounts: any) => prevCounts.merge(newCounts))
                }
            })
        }, [])
        const manageGroupsDropdown = <DropdownButtons title={"Options"} buttonData={[]} disabled={true} />
        return (
            <div className="df-banner-wrapper">
                <Banner
                    filters={selectedFilters}
                    counts={counts}
                    groupSummary={groupSummary}
                    manageGroupsDropdown={manageGroupsDropdown}
                />
            </div>

        )
    }
    return <div></div>
}
