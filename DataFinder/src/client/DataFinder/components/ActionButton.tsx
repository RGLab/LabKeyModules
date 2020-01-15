import * as React from 'react';
import { participantGroupInfo } from '../../typings/CubeData';
import { loadParticipantGroup } from '../helpers/ParticipantGroup';

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
    loadParticipantGroup: (groupName: string) => void
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
    const buttons = groups.map((group) => {
        return (
            {
                label: group.label,
                value: group.id
            }
        )
    })
    const clickGroup = (label, value) => {
        return (
            () => loadParticipantGroup(label)
        )
    }
    return (
        <ActionDropdown title={"Load"} buttons={buttons} onClick={clickGroup} />
    )
}