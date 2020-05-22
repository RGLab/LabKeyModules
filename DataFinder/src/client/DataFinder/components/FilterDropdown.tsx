import * as React from 'react';
import { Filter, FilterCategory } from '../../typings/CubeData'
import { List} from 'immutable'

// Types 
export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: FilterCategory[];
    filterClick: (dim: string, filter: Filter) => () => void;
    selected: List<string>;
    label?: string;
}



interface ContentDropdownProps {
    id: string
    label: string;
    content?: JSX.Element;
    customMenuClass?: string;
    disabled?: boolean
}

interface AndOrDropdownProps {
    status?: string;
    onClick: (value: string) => void;
}

export const FilterDropdown_old: React.FC<FilterDropdownProps> = ({ dimension, level, members, filterClick, selected, children, label }) => {
    // if (props.selected != undefined) debugger

    const levelArray = level.split(".")
    const dropdownLabel = label || levelArray[0]
    const labels = members.map(m => m.label)
    return (
        <div className={"dropdown"}>
            <div id={"df-filter-dropdown-" + levelArray[0]} className="btn-group filterselector" role="group">
                <button 
                    id={levelArray[0] + "-filter-dropdown"} 
                    className="btn btn-default dropdown-toggle filter-dropdown-button" 
                    type="button" 
                    onClick={() => {
                        const cl = document.getElementById("df-filter-dropdown-" + levelArray[0]).classList
                        if (cl.contains("open")) {
                            cl.remove("open")
                        } else {
                            cl.add("open")
                        }
                    }}
                >
                    <span>{dropdownLabel}</span>
                    <span style={{float:"right"}}><i className="fa fa-caret-down"></i></span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div id={level} className="form-group">
                        {labels.map((e) => {
                            let checked: boolean;
                            if (selected == undefined) {
                                checked = false
                            } else if (selected.includes(e)) {
                                checked = true;
                            } else {
                                checked = false;
                            }

                            return (
                                <div className="checkbox" key={e}>
                                    <label >
                                        <input
                                            type="checkbox"
                                            name={level}
                                            value={e}
                                            defaultChecked={checked}
                                            onChange={filterClick(dimension, { level: level, member: e })}
                                            readOnly />
                                        <span>{e}</span>
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {children}

            </div>
        </div>
    )
}



export const FilterDropdownContent: React.FC<FilterDropdownProps> = 
({ 
        dimension, 
        level, 
        members, 
        filterClick, 
        selected
    }) => {

    const labels = members.map(m => m.label)
    return(
            <div id={level} className="form-group">
                {labels.map((e) => {
                    let checked: boolean;
                    if (selected == undefined) {
                        checked = false
                    } else if (selected.includes(e)) {
                        checked = true;
                    } else {
                        checked = false;
                    }

                    return (
                        <div className="checkbox" key={e}>
                            <label >
                                <input
                                    onClick={filterClick(dimension, { level: level, member: e })}
                                    type="checkbox"
                                    name={level}
                                    value={e}
                                    checked={checked}
                                    readOnly />
                                <span>{e}</span>
                            </label>
                        </div>
                    )
                })}
            </div>
    )
}


export const ContentDropdown: React.FC<ContentDropdownProps> = ({ id, label, content, customMenuClass, disabled, children }) => {
    return (
        <>
            <div className={"dropdown"}>
                <div id={"df-content-dropdown-" + id} className={"btn-group filterselector" + disabled && " disabled"} role="group" >
                    <button 
                        id={"content-dropdown-button-" + id} 
                        className="btn btn-default dropdown-toggle filter-dropdown-button" 
                        type="button" 
                        onClick={() => {
                            const cl = document.getElementById("df-content-dropdown-" + id).classList
                            const willOpen = !cl.contains("open")
                            for (let el of document.getElementsByClassName('filterselector open')) {
                                el.classList.remove("open")
                            };
                            if (willOpen) {
                                cl.add("open")
                            }
                        }}
                        >
                        <span>{label}</span>
                        <span style={{float:"right"}}><i className="fa fa-caret-down"></i></span>
                    </button>
                    <div className={"dropdown-menu " + (customMenuClass || "")}>
                        {content}
                    </div>
                    {children}
                </div>
            </div>
        </>
    )
}

export const AndOrDropdown: React.FC<AndOrDropdownProps> = ({ status, onClick }) => {
    if (status == undefined) status = "OR"
    const statusText = {
        AND: "All of",
        OR: "Any of"
    }

    const buttonData = [
        {
            label: statusText.AND,
            action: () => onClick("AND"),
            disabled: false
        },
        {
            label: statusText.OR,
            action: () => onClick("OR"),
            disabled: false
        }
    ]
    const title = statusText[status]
    return (
        <div className="dropdown" style={{ float: "left", display: "inline-block"}}>
            <div className="btn df-dropdown-button df-andor-dropdown" role="group" >
                <button className="btn btn-default dropdown-toggle" 
                        type="button" 
                        id={"button-" + title} 
                        data-toggle="dropdown" 
                        aria-haspopup="true" 
                        aria-expanded="true"
                        style={{display: 'inline-block'}}
                >
                    <span>{title}</span>
                    <span style={{paddingLeft: "5px"}}><i className="fa fa-caret-down"></i></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby={"button-" + title} style={{left: "15px"}}>
                    {buttonData.map((button) => {
                        return (
                            <li className={button.disabled ? "disabled" : ""}>
                                <a key={button.label} onClick={button.action} href="#">
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