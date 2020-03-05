import React from 'react'
import { ISelectedFilters, SelectedFilters } from '../typings/CubeData';
import { Banner } from '../DataFinder/components/Banner';
import localStorage from '../DataFinder/helpers/localStorage'


export const FilterBanner = ({ show }) => {
    if (show) {
        // get filters from localStorage
        const sf: ISelectedFilters = JSON.parse(localStorage.getItem("dataFinderSelectedFilters"))
        let bannerInfo = JSON.parse(localStorage.getItem("dataFinderBannerInfo"))
        if (bannerInfo == null) {
            bannerInfo = {
                groupName: "",
                counts: { participant: null, study: null },
                unsavedFilters: false
            }
        }
        const selectedFilters = new SelectedFilters(sf)
        return (
            <div className="df-banner-wrapper">
                <Banner
                    filters={selectedFilters}
                    groupName={bannerInfo.groupName}
                    counts={bannerInfo.counts}
                    unsavedFilters={bannerInfo.unsavedFilters}
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
