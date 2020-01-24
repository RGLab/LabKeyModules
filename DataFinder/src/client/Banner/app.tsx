import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { FilterBanner } from './FilterBanner'



window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<FilterBanner show={window.location.search != "" && window.location.pathname == "/project/Studies/begin.view"}/>, document.getElementById('filter-banner'));
    document.getElementById("filter-banner").parentElement.style.width = "100%"
});
