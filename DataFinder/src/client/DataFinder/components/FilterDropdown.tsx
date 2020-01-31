import * as React from 'react';
import { Filter, FilterCategories, FilterCategory } from '../../typings/CubeData'
import { Map, List, fromJS } from 'immutable'

// Types 
export interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: FilterCategory[];
    filterClick: (dim: string, filter: Filter) => () => void;
    selected: List<List<string>>;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({dimension, level, members, filterClick, selected, children}) => {
    // if (props.selected != undefined) debugger
    const labels = members.map(m => m.label)
    return (
        <div className={"dropdown"} style={{width: "50px"}}>
            <div className="btn-group filterselector" role="group" >
                <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
                    <span>{level}</span>
                    <span>&#9660;</span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div id={level} className="form-group">
                        {labels.map((e) => {
                            let checked: boolean;
                            if (selected == undefined) {
                                checked = false
                            } else if (selected.includes(List([e]))) {
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