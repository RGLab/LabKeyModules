import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { FilterBanner } from './FilterBanner'



window.addEventListener('DOMContentLoaded', (event) => {
    const page = LABKEY.ActionURL.getParameter("pageId")
    const show = page === undefined || page != "Find"
    ReactDOM.render(<FilterBanner show={show}/>, document.getElementById('filter-banner'));
});
