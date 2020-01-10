import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Banner } from './FilterBanner'
import { AppContainer } from 'react-hot-loader'


const render = () => {
    ReactDOM.render(
        <AppContainer>
            <Banner />
        </AppContainer>,
        document.getElementById('filter-banner')
    )
};

declare const module: any;

window.addEventListener('DOMContentLoaded', () => {
    render();
    if (module.hot) {
        module.hot.accept();
    }
});