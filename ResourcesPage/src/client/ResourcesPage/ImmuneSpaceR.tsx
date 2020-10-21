import * as React from "react";
import Iframe from 'react-iframe';

export const ImmuneSpaceR = () => {
    return (
        <div id="ImmuneSpaceR" style={{alignItems: "center", display: "flex", justifyContent: "center"}}>
            <Iframe
                url="https://rglab.github.io/ImmuneSpaceR/"
                width="90%"
                height="450px"
            />
        </div>
    )
}