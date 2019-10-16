// Imports
import * as React from 'react';
import "./Hello.scss"

// Define Components
const Hello: React.FC = () => {
    const greeting: Greeting = {
        cssClass: "greeting",
        text: "Hello!"
    }
    return(
        <div className = {greeting.cssClass}>{greeting.text}</div>
    )
}


// There should be a single export: a component called "App"
export const App: React.FC = () => {

    return <Hello />

}
