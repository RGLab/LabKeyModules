import React from 'react'
import { ISelectedFilters, SelectedFilters } from '../typings/CubeData';
import { Banner, GroupSummary } from '../DataFinder/components/Banner';
import localStorage from '../DataFinder/helpers/localStorage'
import { ContentDropdown } from '../DataFinder/components/FilterDropdown';


export const FilterBanner = ({ show }) => {
    if (show) {
        // get state from sessionParticipantGroup API
        const sf: ISelectedFilters = JSON.parse(localStorage.getItem("dataFinderSelectedFilters"))
        let bannerInfo = JSON.parse(localStorage.getItem("dataFinderBannerInfo"))
        if (bannerInfo == null) {
            bannerInfo = {
                groupName: "",
                counts: { participant: null, study: null },
                unsavedFilters: false
            }
        }
        const groupSummary = new GroupSummary({
            label: bannerInfo.groupName,
            id: 0,
            isSaved: bannerInfo.unsavedFilters
        })
        const selectedFilters = new SelectedFilters(sf)
        const manageGroupsDropdown = <ContentDropdown id="manage-groups" label="Manage Groups" disabled={true}></ContentDropdown>
        return (
            <div className="df-banner-wrapper">
                <Banner
                    filters={selectedFilters}
                    counts={bannerInfo.counts}
                    groupSummary={groupSummary}
                    manageGroupsDropdown={manageGroupsDropdown}
                    links={
                        <>
                            <a className="labkey-text-link" href="/immport/Studies/exportStudyDatasets.view?">Export Study Datasets</a>
                            <a className="labkey-text-link" href="/rstudio/start.view?">RStudio</a>
                        </>
                    }
                />
            </div>

        )
    }
    return <div></div>
}
