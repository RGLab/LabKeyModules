import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Banner } from './FilterBanner'



window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<Banner show={window.location.search != "" && window.location.pathname == "/project/Studies/begin.view"}/>, document.getElementById('filter-banner'));
});
