import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './HighlightedReports'

window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<App/>, document.getElementById('app'));
});