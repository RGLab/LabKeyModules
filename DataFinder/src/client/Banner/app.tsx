import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { FilterBanner } from './FilterBanner'



window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<FilterBanner show={true}/>, document.getElementById('filter-banner'));
});
