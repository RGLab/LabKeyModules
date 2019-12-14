import * as React from 'react';
import * as Cube from '../../typings/Cube'
import { Filter } from '../../typings/CubeData';

// Types 
interface FilterDropdownProps {
    dimension: string;
    level: string;
    members: string[];
    toggleFilter: (filter: Filter) => () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = (props: FilterDropdownProps) => {

    return (
        <div className={"dropdown"}>
            <div className="btn-group filterselector" role="group" >
                <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">
                    <span>{props.dimension}</span>
                    <span>&#9660;</span>
                </button>
                <div className="dropdown-menu filter-dropdown">
                    <div id={props.level} className="form-group">
                        {props.members.map((e) => {
                            return (
                                <div className="checkbox" key={e}>
                                    <label onClick={props.toggleFilter({dim: props.dimension, level: props.level, label: e})}>
                                        <input type="checkbox" name={props.level} value={e}/>
                                        <span>{e}</span>
                                    </label>
                                </div>
                            )

                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}