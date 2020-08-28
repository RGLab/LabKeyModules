import * as React from "react";


export const PLOT_OPTIONS = [
    {value: 'study', label: 'By Study'},
    {value: 'month', label:  'By Month'},
]

export const BY_STUDY_ORDER_OPTIONS = [
    {value: 'UI', label: 'UI Pageviews'},
    {value: 'ISR', label:  'ImmuneSpaceR connections'},
    {value: 'total', label: 'All interactions'}
]

export const AddlInfoBar = () => {
    return(
        <div>
            <ul>
                <li>Hover over each bar for specific study data</li>
                <li>Click on the Y-axis label to go to study overview page</li>
                <li>Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"</li>
            </ul>
        </div>
    )
}

export const AddlInfoLine = () => {
    return(
        <div>
            <ul>
                <li>Toggle between a chronological view of user interactions "By Month" or on a per study basis with "By Study"</li>
            </ul>
        </div> 
    )
}