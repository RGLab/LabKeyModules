import React from "react";
import {renderHtmlWidget} from "./helperFunctions";

interface props {
    rSessionParsed: any;
    rScriptsLoaded: boolean;
}

// Create MutationObserver that calls f when a child element has been added to elem
// Could be factored out as a utility function
const onAppend = function(elem, f) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.addedNodes.length) {
                f(m.addedNodes)
            }
        })
    })
    observer.observe(elem, {childList: true})
}

export const RSessionInfo = React.memo<props>(( { rSessionParsed, rScriptsLoaded }: props) => {
    const divRef = React.useRef(null)

    React.useEffect(() => {
        if (rScriptsLoaded) {
            divRef.current.innerHTML = '' // Clear the container
            onAppend(divRef.current, renderHtmlWidget);

            divRef.current.appendChild(rSessionParsed.cloneNode(true)) // appendChild() is by reference not copy
        }
    }, [rSessionParsed, rScriptsLoaded])

    return (
        <div ref={divRef}>
            <i aria-hidden="true" className="fa fa-spinner fa-pulse" style={{marginRight:'5px'}}/>
            Loading R Session Info
        </div>
    )
});