import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Banner } from './FilterBanner'



window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<Banner/>, document.getElementById('filter-banner'));
});
