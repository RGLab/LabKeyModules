import React from "react";
import AEDropdown from "./AEDropdown";
import DiseaseSelector from "./DiseaseSelector";
import { Button, Form, InputGroup } from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import { diseaseConditions } from "../helpers/constants";
import "./SecondarySelectorSimple.scss";

interface SecondarySelectorReturnType {
  disease: string;
  analyteName: string;
  analyteType: string;
}

interface SecondarySelectorSimpleProps {
  analyte: string;
  callback: (results: SecondarySelectorReturnType) => void;
}

const SecondarySelectorSimple: React.FC<SecondarySelectorSimpleProps> = ({
  analyte,
  callback,
}) => {
  const [diseaseSelected, setDiseaseSelected] = React.useState(
    "Select disease condition"
  );

  const searchBar = React.useRef(null);

  const plotOnclick = (e: React.MouseEvent<HTMLButtonElement>) => {
    callback({
      disease: diseaseSelected,
      analyteName: searchBar.current.value,
      analyteType: analyte,
    });
  };

  return (
    <div className="ae-analyte-selector-container">
      <div className="ae-analyte-selector-content">
        <DiseaseSelector dropdownOptions={diseaseConditions} />

        <InputGroup className="search-input-group">
          <InputGroup.Prepend>
            <InputGroup.Text id="search-icon-addon">
              <AiOutlineSearch className="search-icon" />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form className="search-form">
            <Form.Group controlId="formSearchAnalyte">
              <Form.Control
                type="text"
                placeholder="somethng"
                ref={searchBar}
              />
            </Form.Group>
          </Form>
        </InputGroup>
        <div className="submit-container">
          <Button variant="warning" className="plot-btn" onClick={plotOnclick}>
            Plot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecondarySelectorSimple;
