import React from "react";
import { Dropdown } from "react-bootstrap";
import "./AEDropdown.scss";

interface AEDropdownProps {
  selected: string;
  dropdownOptions: string[];
  callback: (selection: string) => void;
}

const AEDropdown: React.FC<AEDropdownProps> = (props) => {
  const dropDownOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const selection = e.currentTarget.textContent;
    props.callback(selection);
  };
  return (
    <Dropdown className="analyte-dropdown-container">
      <Dropdown.Toggle className="analyte-dropdown">
        <div className="analyte-dropdown-btn-text">{props.selected}</div>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {props.dropdownOptions.map((option) => {
          return (
            <Dropdown.Item
              onClick={dropDownOnClick}
            >{`${option}`}</Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AEDropdown;
