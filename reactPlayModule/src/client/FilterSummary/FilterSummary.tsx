import * as React from 'react';
import * as LABKEY from '@labkey/api';
import {AppliedFilters, filterMembers} from './components/AppliedFilters'

// Use a stateful functional component as the "controller" 
function FilterView() {
    // State variables ------------------------------------------------------
    const [participantCount, setParticipantCount] = React.useState(0);
    const [studyCount, setStudyCount] = React.useState(0);
    const [filters, setFilters] = React.useState({"study": [], "participant": [], "sample": []})

    // Effects ------------------------------------------------------
    React.useEffect(() => {
        update()
    }, [])

    // Other Setup ------------------------------------------------------
    // Get filters from localStorage
    // TODO:  Update once filter handling has been updated
    let filterKey = "";
    let filterFound = false;
    let i = 0;
    const re = /filterSet/
    while (!filterFound && i < localStorage.length ) {
        filterKey = localStorage.key(i);
        filterFound = re.test(filterKey);
        i++
    }

    // Helper Functions ------------------------------------------------------
    // update 
    function update() {

        // Summary 
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: "StudyProperties",
            success: (data: SelectRowsResponse) => {
                const rowCount = data.rowCount;
                setStudyCount(rowCount);}
        });
        LABKEY.Query.selectRows({
            schemaName: "study",
            queryName: "demographics",
            success: (data: SelectRowsResponse) => {
                const rowCount = data.rowCount;
                setParticipantCount(rowCount);}
        })

        // Filters
        const filters_tmp: GroupedFilters = {"study": [], "participant": [], "sample": []}
        const allFilters = JSON.parse(localStorage.getItem(filterKey));
        const filterKeys = Object.keys(allFilters)
        filterKeys.forEach((key) => {
            if (filterMembers.study.indexOf(key) !== -1) {
                filters_tmp.study.push(allFilters[key])
            } else if (filterMembers.participant.indexOf(key) !== -1) {
                filters_tmp.participant.push(allFilters[key])
            } else if (filterMembers.sample.indexOf(key) !== -1) {
                filters_tmp.sample.push(allFilters[key])
            }
        })
        setFilters(filters_tmp);
    }

    // Element to return
    return(
        <div className='container wrapper'>
            <h2>Current Filters</h2>
            <button type="button" onClick={update}>Update</button>
            <button type="button"><a href="./begin.view?">Edit</a></button>
            <p><em>{participantCount} participants from {studyCount} studies</em></p>
            <AppliedFilters filters = {filters} />
        </div>
    )

}

// Need to export a component called "App"
export function App() {

    return <FilterView />

}
