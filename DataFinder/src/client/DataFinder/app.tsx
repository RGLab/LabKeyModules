import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './DataFinder_immutable'


window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<App/>, document.getElementById('app'));
});

const menu = document.getElementsByClassName('.dropdown-menu')

// for (var i = 0; i < menu.length; i++) {
//     menu[i].addEventListener('click', (e) => {
//         console.log("stopping....");e.stopPropagation()})
// }