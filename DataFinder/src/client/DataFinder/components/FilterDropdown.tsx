import * as React from 'react';
import { Filter } from '../../typings/CubeData'
import { Map, List, fromJS } from 'immutable'

// Types 
export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: string[];
    filterClick: (dim: string, filter: Filter) => () => void;
    selected: List<List<string>>;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = (props) => {
    // if (props.selected != undefined) debugger
    return (
        <div className={"dropdown"} style={{width: "50px"}}>
            <div className="btn-group filterselector" role="group" >
                <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
                    <span>{props.level}</span>
                    <span>&#9660;</span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div id={props.level} className="form-group">
                        {props.members.map((e) => {
                            let checked: boolean;
                            if (props.selected == undefined) {
                                checked = false
                            } else if (props.selected.includes(List([e]))) {
                                checked = true;
                            } else {
                                checked = false;
                            }

                            return (
                                <div className="checkbox" key={e}>
                                    <label >
                                        <input
                                            onClick={props.filterClick(props.dimension, { level: props.level, member: e })}
                                            type="checkbox"
                                            name={props.level}
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
                {props.children}

            </div>
        </div>
    )
}