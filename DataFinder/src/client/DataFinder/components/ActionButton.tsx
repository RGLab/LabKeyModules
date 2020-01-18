import * as React from 'react';
import { participantGroupInfo, GroupInfo } from '../../typings/CubeData';

interface ActionButtonProps {
    onClick: () => void;
    text: string;
}

interface ActionDropdownProps {
    title: string;
    buttons: {
        label: string;
        value: any;
    }[]
    onClick: (label: string, value: string) => () => void;
}

interface LoadDropdownProps {
    groups: participantGroupInfo[],
    loadParticipantGroup: (groupInfo: GroupInfo) => void
}

export const ActionButton: React.FC<ActionButtonProps> = (props) => {
    return (
        <button onClick={props.onClick} disabled={false}>
            {props.text}
        </button>

    )
}

export const ActionDropdown: React.FC<ActionDropdownProps> = (props) => {
    return (
        <div className="dropdown" style={{width: "50px"}}>
            <div className="btn-group filterselector" role="group" >
                <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
                    <span>{props.title}</span>
                    <span>&#9660;</span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div className="form-group">
                        {props.buttons.map((e) => {
                            return (
                                <button key={e.label} onClick={props.onClick(e.label, e.value)}>
                                    {e.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}

export const LoadDropdown: React.FC<LoadDropdownProps> = ({ groups, loadParticipantGroup }) => {

    return (
        <div className="dropdown" style={{width: "50px"}}>
            <div className="btn-group filterselector" role="group" >
                <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
                    <span>Load</span>
                    <span>&#9660;</span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div className="form-group">
                        {groups.map((group) => {
                            return (
                                <button key={group.label} onClick={() => loadParticipantGroup(group)}>
                                    {group.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}