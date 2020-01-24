import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { FilterBanner } from './FilterBanner'
import { AppContainer } from 'react-hot-loader'


const render = () => {
    ReactDOM.render(
        <AppContainer>
            <FilterBanner show={!(window.location.search == "" && window.location.pathname == "/project/Studies/begin.view")}/>
        </AppContainer>,
        document.getElementById('filter-banner')
    )
};

declare const module: any;

window.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById("filter-banner").parentElement.style.width = "100%"
    if (module.hot) {
        module.hot.accept();
    }
});