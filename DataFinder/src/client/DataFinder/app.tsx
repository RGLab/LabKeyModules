import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { DataFinder } from './DataFinder'


window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<DataFinder/>, document.getElementById('data-finder'));
});

// Close any dropdown menu when clicking outside of it
// https://stackoverflow.com/questions/25089297/avoid-dropdown-menu-close-on-click-inside
document.getElementsByTagName('body')[0].addEventListener('click', function (e) {
    const target = e.target as HTMLElement
    if (document.getElementsByClassName("open").length > 0) {
        const someParentHasClass = (el, className) => {
            if (el.classList.contains(className)) return true
            if (el.tagName == "BODY") return false
            return el.parentNode && someParentHasClass(el.parentNode, className)
        }
        if (! someParentHasClass(target, "df-outer-dropdown") ) {
            for (let el of document.querySelectorAll('.df-outer-dropdown>.open')) {
                el.classList.remove("open")
            };
        }
        if (! someParentHasClass(target, "df-filter-dropdown") || someParentHasClass(target, "assay-data-dropdown") ) {
            for (let el of document.querySelectorAll('.df-filter-dropdown>.open')) {
                el.classList.remove("open")
            };
        }
    }
});


// const menu = document.getElementsByClassName('.filterselector')

// for (var i = 0; i < menu.length; i++) {
//     menu[i].addEventListener('click', function (even) {
//         this.value.parent().toggleClass("open");
//     })
// }
