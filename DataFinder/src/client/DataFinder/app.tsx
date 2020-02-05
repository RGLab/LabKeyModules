import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './DataFinder'


window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<App/>, document.getElementById('app'));
});

const menu = document.getElementsByClassName('.filterselector')

for (var i = 0; i < menu.length; i++) {
    menu[i].addEventListener('click', function (even) {
        this.value.parent().toggleClass("open");
    })
}
