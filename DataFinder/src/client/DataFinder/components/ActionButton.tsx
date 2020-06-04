import * as React from 'react';
import { GroupInfo } from '../../typings/CubeData';

interface ActionButtonProps {
    onClick: () => void;
    text: string;
}


interface HighlightedButtonProps {
    label: string;
    action?: () => void;
    href?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = (props) => {
    return (
        <button 
            id={'action-button-' + props.text} 
            onClick={props.onClick} 
            disabled={false}
        >
            {props.text}
        </button>

    )
}

export const HighlightedLink = React.memo<HighlightedButtonProps>(({label, href}) => {
    return <a href={href ?? "#"} >
        <button className="btn btn-warning df-highlighted-button">
        {label}
        </button>
    </a>;
  });

export const HighlightedButton: React.FC<HighlightedButtonProps> = ({label, action}) => {
    return <button className="btn btn-warning df-highlighted-button" onClick={action ?? (() => {})}>
        {label}
        </button>
}

interface ClearDropdownProps {
    clearAll: () => void;
    reset: () => void;
}

export const ClearDropdown: React.FC<ClearDropdownProps> = ({ clearAll, reset }) => {
    const buttonData = [
        {
            label: "Clear All",
            action: clearAll,
            disabled: false
        },
        {
            label: "Clear Unsaved Changes",
            action: reset,
            disabled: false
        }
    ]
    return (
        <DropdownButtons title={"Clear"} buttonData={buttonData} />
    )
}



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
}

interface DropdownContentProps {
    title: string
    buttonData: ButtonData[]
    open: boolean
}

export const DropdownButtons: React.FC<DropdownButtonProps> = ({ title, buttonData }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="dropdown">
            <div className={"btn" + (open ? " open" : "")} role="group" >
                <button className="btn btn-default dropdown-toggle" type="button" onClick={() => {console.log("opening?"); setOpen(!open)}}>
                    <span>{title}</span>
                    <span style={{paddingLeft:"5px"}}><i className="fa fa-caret-down"></i></span>
                </button>
                <DropdownContent buttonData={buttonData} title={title} open={open}/>
            </div>
        </div>
    )
}

export const InnerDropdownButtons: React.FC<DropdownButtonProps> = ({ title, buttonData }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="dropdown df-sub-dropdown">
            <div className={open ? " open" : ""} role="group" >
                <button type="button" onClick={() => {console.log("opening?"); setOpen(!open)}}>
                    <span>{title}</span>
                    <span style={{paddingLeft:"5px"}}><i className={"fa fa-caret-"+(open ? "down" : "right")}></i></span>
                </button>
                <InnerDropdownContent buttonData={buttonData} title={title} open={open}/>
            </div>
        </div>
    )
}

const DropdownContent: React.FC<DropdownContentProps> = ({buttonData, title, open}) => {
    return <ul className="dropdown-menu df-dropdown" aria-labelledby={"button-" + title} style={open ? {display: "block"} : {}}>
    {buttonData.map((button) => {
        return (
            <li key={button.label} className={"df-dropdown-button " + (button.disabled ? "disabled" : "")}>
                {(() => {
                    if (button.buttonData) {
                        return (<InnerDropdownButtons title={button.label} buttonData={button.buttonData}/>);
                    } else {
                        return <a style={{ padding: "0px 5px" }} key={button.label} href={button.href ?? "#"}>
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

const InnerDropdownContent: React.FC<DropdownContentProps> = ({buttonData, title, open}) => {
    return <ul className="dropdown-menu df-dropdown" aria-labelledby={"button-" + title} style={open ? {display: "contents"} : {}}>
    {buttonData.map((button) => {
        return (
            <li key={button.label} className={"df-dropdown-button " + (button.disabled ? "disabled" : "")}>
                {(() => {
                    if (button.buttonData) {
                        return (<InnerDropdownButtons title={button.label} buttonData={button.buttonData}/>);
                    } else {
                        return <a style={{ padding: "0px 5px", marginLeft: "20px" }} key={button.label} href={button.href ?? "#"}>
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
