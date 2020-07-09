import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { FilterBanner } from './FilterBanner'
import { AppContainer } from 'react-hot-loader'


const render = () => {
    const page = LABKEY.ActionURL.getParameter("pageId")
    const show = page === undefined || page != "Find"
    ReactDOM.render(
        <AppContainer>
            <FilterBanner show={show}/>
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