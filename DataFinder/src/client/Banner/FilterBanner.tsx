import React from 'react'
import { FilterSummary } from '../DataFinder/components/FilterIndicator'
import { ISelectedFilters, SelectedFilters } from '../typings/CubeData';


export const FilterBanner = ({show}) => {
    if (show) {
        // get filters from localStorage
        const sf: ISelectedFilters = JSON.parse(localStorage.getItem("dataFinderSelectedFilters"))
        const selectedFilters = new SelectedFilters(sf)
        return(
            <div>
                <FilterSummary filters={selectedFilters}/>
            </div>
        )
    } 
    return <div></div>
}

