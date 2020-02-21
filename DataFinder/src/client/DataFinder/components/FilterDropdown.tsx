import * as React from 'react';
import { Filter, FilterCategories, FilterCategory } from '../../typings/CubeData'
import { Map, List, fromJS } from 'immutable'
import { DropdownButtons } from './ActionButton';

// Types 
export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: FilterCategory[];
    filterClick: (dim: string, filter: Filter) => () => void;
    selected: List<string>;
}

interface ContentDropdownProps {
    id: string
    label: string;
    content: JSX.Element;
}

interface AndOrDropdownProps {
    status?: string;
    onClick: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ dimension, level, members, filterClick, selected, children }) => {
    // if (props.selected != undefined) debugger

    const levelArray = level.split(".")
    const labels = members.map(m => m.label)
    return (
        <div className={"dropdown"}>
            <div className="btn-group filterselector" role="group">
                <button className="btn btn-default dropdown-toggle" 
                        type="button" 
                        data-toggle="dropdown"
                        style={{width:'140px', display: 'inline-block'}}
                >
                    <span>{levelArray[0]}</span>
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
                </div>
                {children}

            </div>
        </div>
    )
}

export const ContentDropdown: React.FC<ContentDropdownProps> = ({ id, label, content, children }) => {
    return (
        <>
            <div className={"dropdown"}>
                <div id={"df-content-dropdown-" + id} className="btn-group filterselector" role="group" >
                    <button className="btn btn-default dropdown-toggle"style={{width: "140px"}} type="button" onClick={() => {
                        const cl = document.getElementById("df-content-dropdown-" + id).classList
                        if (cl.contains("open")) {
                            cl.remove("open")
                        } else {
                            cl.add("open")
                        }
                    }}>
                        <span>{label}</span>
                        <span style={{float:"right"}}><i className="fa fa-caret-down"></i></span>
                    </button>
                    <div className="dropdown-menu assay-timepoint-dropdown">
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
        AND: "AND (all of)",
        OR: "OR (any of)"
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