import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { DataAccess } from './DataAccess'

window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<DataAccess/>, document.getElementById('data-access'));
});