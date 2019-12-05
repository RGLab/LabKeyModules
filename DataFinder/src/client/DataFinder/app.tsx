import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './DataFinder'


window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<App/>, document.getElementById('app'));
});