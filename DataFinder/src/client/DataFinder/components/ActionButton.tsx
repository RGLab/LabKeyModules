import * as React from 'react';
import { GroupInfo } from '../../typings/CubeData';

interface ActionButtonProps {
    onClick: () => void;
    text: string;
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

interface LoadDropdownProps {
    groups: GroupInfo[],
    loadParticipantGroup: (groupInfo: GroupInfo) => void
}

export const LoadDropdown: React.FC<LoadDropdownProps> = ({ groups, loadParticipantGroup }) => {
    const buttonData = groups.map((group) => {
        return ({
            label: group.label,
            action: () => loadParticipantGroup(group),
            disabled: false
        })
    })
    return (
        <DropdownButtons buttonData={buttonData} title={"Load"} />
    )
}

interface SaveDropdownProps {
    saveAs: () => void;
    save: () => void;
    disableSave: boolean
}

export const SaveDropdown: React.FC<SaveDropdownProps> = ({ saveAs, save, disableSave }) => {
    const buttonData = [
        {
            label: "Save",
            action: save,
            disabled: disableSave
        },
        {
            label: "Save As",
            action: saveAs,
            disabled: false
        }
    ]
    return (
        <DropdownButtons title="Save" buttonData={buttonData} />
    )
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




interface DropdownButtonProps {
    title: string
    buttonData: {
        label: string;
        action: () => void;
        disabled: boolean
    }[]
}
export const DropdownButtons: React.FC<DropdownButtonProps> = ({ title, buttonData }) => {
    return (
        <div className="dropdown" style={{  display: "inline-block", margin: "5px" }}>
            <div className="btn df-dropdown-button" role="group" >
                <button className="btn btn-default dropdown-toggle" type="button" id={title + "-participant-group-btn"} data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span>{title}</span>
                    <span style={{paddingLeft:"5px"}}><i className="fa fa-caret-down"></i></span>
                </button>
                <ul className="dropdown-menu df-dropdown" aria-labelledby={"button-" + title}>
                    {buttonData.map((button) => {
                        return (
                            <li key={button.label} className={button.disabled ? "disabled" : ""}>
                                <a id={button.label.replace(" ", "-") + "-link"} key={button.label} onClick={button.action} href="#">
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
