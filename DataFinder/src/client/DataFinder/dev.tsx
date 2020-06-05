import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'

import { App } from './DataFinder'

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <App />
        </AppContainer>,
        document.getElementById('app')
    )


};

declare const module: any;

window.addEventListener('DOMContentLoaded', () => {
    render();

    if (module.hot) {
        module.hot.accept();
    }
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
    }
});
