import React from "react";
import AEDropdown from "./AEDropdown";
import { AiOutlineClose } from "react-icons/ai";
import "./DiseaseSelector.scss";

interface DiseaseButtonProps {
  index: number;
  value: string;
  callback: (index: number) => void;
}

interface DiseaseSelectorProps {
  dropdownOptions: string[];
}

const DiseaseButton: React.FC<DiseaseButtonProps> = ({
  index,
  value,
  callback,
}) => {
  const closeIconOnclick = (e: React.MouseEvent<SVGElement>) => {
    callback(index);
  };
  return (
    <div className="disease-btn">
      <span className="disease-btn-text">{`${value}`}</span>
      <AiOutlineClose
        className="disease-close-icon"
        onClick={closeIconOnclick}
      />
    </div>
  );
};

const DiseaseSelector: React.FC<DiseaseSelectorProps> = ({
  dropdownOptions,
}) => {
  const [diseaseSelected, setDiseaseSelected] = React.useState<string[]>([]);

  const addDieseaseSelected = (disease: string) => {
    if (!diseaseSelected.includes(disease)) {
      setDiseaseSelected([...diseaseSelected, disease]);
    }
  };

  const removeDiseaseSelected = (index: number) => {
    let currentDieasesList = [...diseaseSelected]; // creates brand new copy as to not directly modify the state array.
    currentDieasesList.splice(index, 1);
    setDiseaseSelected(currentDieasesList);
  };
  return (
    <div className="disease-selector">
      <AEDropdown
        selected={"Select disease condition"}
        dropdownOptions={dropdownOptions}
        callback={addDieseaseSelected}
      />
      <div className="disease-display">
        {diseaseSelected.map((disease, index) => {
          return (
            <DiseaseButton
              index={index}
              value={disease}
              callback={removeDiseaseSelected}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiseaseSelector;
