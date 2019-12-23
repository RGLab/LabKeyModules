import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'

import { App } from './DataFinder_immutable'

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <App />
        </AppContainer>,
        document.getElementById('app')
    )

    // const menu = document.getElementsByClassName('dropdown-menu')

    // for (var i = 0; i < menu.length; i++) {
    //     menu[i].addEventListener('click', (e) => {
    //         console.log("stopping...."); e.stopPropagation()
    //     })
    // }
};

declare const module: any;

window.addEventListener('DOMContentLoaded', () => {
    render();
    if (module.hot) {
        module.hot.accept();
    }
});

