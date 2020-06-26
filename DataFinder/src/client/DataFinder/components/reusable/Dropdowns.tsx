import React from 'react'
import "./Dropdowns.scss"

interface ButtonData {
    label: string;
    icon?: JSX.Element;
    action?: () => void;
    disabled?: boolean;
    href?: string;
    buttonData?: ButtonData[]
}

interface DropdownButtonProps {
title: string
buttonData: ButtonData[]
disabled?: boolean
}

interface DropdownContentProps {
buttonData: ButtonData[]
open?: boolean
}

interface OuterDropdownButtonProps {
disabled?: boolean;
title: string;
}



// This essentially just creates a bootstrap button dropdown
export const SimpleDropdown: React.FC<DropdownButtonProps> = ({ title, buttonData, disabled }) => {
    return (
        <div className="dropdown df-outer-dropdown">
        <div className={"btn"} role="group" >
            <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button" disabled={disabled}>
                <span>{title}</span>
                <span style={{paddingLeft:"5px"}}><i className="fa fa-caret-down"></i></span>
            </button>
            <ul className="dropdown-menu df-dropdown">
            {buttonData?.map((button) => {
                return (
                    <li key={button.label} className={"df-dropdown-option"}>
                        <a style={{ padding: "0px 5px" }} onClick={button.action} href={button.href}>
                            {button.label}
                        </a>
                    </li>
                )
            })}
            </ul>
        </div>
    </div>
    )
}


// Dropdown with nesting option
export const DropdownButtons: React.FC<DropdownButtonProps> = ({ title, buttonData, disabled }) => {

    return (
        <OuterDropdownButton title={title} disabled={disabled}>
            <DropdownContent buttonData={buttonData} />
        </OuterDropdownButton>
    )
}

export const OuterDropdownButton: React.FC<OuterDropdownButtonProps> = ({children, disabled, title}) => {
    const openRef = React.useRef<HTMLDivElement>(null)
    const open = () => {
        const cl = openRef.current.classList
        const willOpen = !cl.contains("open")
        for (let el of document.querySelectorAll(".df-outer-dropdown>.open")) {
            el.classList.remove("open")
        };
        if (willOpen) {
            cl.add("open")
        }
    }

    return (
        <div className="dropdown df-outer-dropdown">
            <div className={"btn"} ref={openRef} role="group" >
                <button className="btn btn-default dropdown-toggle" type="button" disabled={disabled} onClick={open}>
                    <span>{title}</span>
                    <span style={{paddingLeft:"5px"}}><i className="fa fa-caret-down"></i></span>
                </button>
                {children}
            </div>
        </div>
    )
}

export const InnerDropdownButtons: React.FC<DropdownButtonProps> = ({ title, buttonData }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="dropdown df-sub-dropdown">
            <div className={open ? " open" : ""} role="group" >
                <button type="button" onClick={() => { setOpen(!open)}}>
                    <span>{title}</span>
                    <span style={{paddingLeft:"5px"}}><i className={"fa fa-caret-"+(open ? "down" : "right")}></i></span>
                </button>
                <InnerDropdownContent buttonData={buttonData} open={open} />
            </div>
        </div>
    )
}

const DropdownContent: React.FC<DropdownContentProps> = ({buttonData}) => {
    return <ul className="dropdown-menu df-dropdown">
    {buttonData.map((button) => {
        return (
            <li key={button.label} className={"df-dropdown-option " + (button.disabled ? "disabled" : "")}>
                {(() => {
                    if (button.buttonData) {
                        return (<InnerDropdownButtons title={button.label} buttonData={button.buttonData}/>);
                    } else {
                        return <a style={{ padding: "0px 5px" }} key={button.label} href={button.href}>
                            <button onClick={button.action ?? (() => { })} >
                                {button.label}{button.icon}
                            </button>
                        </a>
                    }
                })()
                }

            </li>
        )
    })}
</ul>
}

const InnerDropdownContent: React.FC<DropdownContentProps> = ({buttonData, open}) => {
    return <ul className="dropdown-menu df-dropdown" style={open ? {display: "contents"} : {}}>
    {buttonData.map((button) => {
        return (
            <li key={button.label} className={"df-dropdown-option " + (button.disabled ? "disabled" : "")}>
                {(() => {
                    if (button.buttonData) {
                        return (<InnerDropdownButtons title={button.label} buttonData={button.buttonData}/>);
                    } else {
                        return <a style={{ padding: "0px 5px", marginLeft: "20px" }} key={button.label} href={button.href}>
                            <button onClick={button.action ?? (() => { })} >
                                {button.label}{button.icon}
                            </button>
                        </a>
                    }
                })()
                }

            </li>
        )
    })}
</ul>
}
