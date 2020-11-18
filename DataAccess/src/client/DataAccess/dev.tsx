import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'

import { DataAccess } from './DataAccess'

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <DataAccess/>
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