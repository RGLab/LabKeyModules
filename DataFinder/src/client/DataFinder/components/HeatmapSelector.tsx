import * as React from 'react';
import {drawHeatmap} from "./d3/HeatmapSelector.d3"
import { HeatmapDatum } from '../../typings/CubeData';

// React stuff ==================================== //

interface HeatmapSelectorProps {
  data: HeatmapDatum[];
}

interface HeatmapProps {
  data: HeatmapDatum[];
  options: {
    breaks: number[];
    colors: string[];
    xaxis: string[];
    yaxis: string[];
  };
  selected: string[];
  height: number;
  name: string;
  width: number;
  handleClick: (id:string) => {}
}

export const HeatmapSelector: React.FC<HeatmapSelectorProps> = (props) => {
    const [selected, setSelected] = React.useState([]);

    const options = {
      "breaks": [
          1,
          10,
          50,
          100,
          500,
          1000
      ],
      "colors": [
          "#FFFFFF",
          "#EDF8E9",
          "#C7E9C0",
          "#A1D99B",
          "#74C476",
          "#41AB5D",
          "#238B45",
          "#005A32"
      ],
      "xaxis": [
          "<0",
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15-27",
          "28",
          "29-55",
          "56",
          ">56"
      ],
      "yaxis": [
          "PCR",
          "Neutralizing Antibody",
          "MBAA",
          "HLA Typing",
          "HAI",
          "Gene Expression",
          "Flow Cytometry",
          "ELISPOT",
          "ELISA",
          "CyTOF"
      ],
      "selected": []
  }

    function handleClick(id) {
      var tmp = selected.slice();
      if (selected.indexOf(id) > -1) {
        tmp.splice(selected.indexOf(id), 1);
        setSelected(tmp);
      } else {
        tmp.push(id);
        setSelected(tmp);
      }
    }
    function clearSelection() {
      setSelected([]);
    }
  
  
    return (
      <div>
        <Heatmap
          data={props.data}
          options={options}
          selected={selected}
          height={250}
          name={"heatmap"}
          width={800}
          handleClick={handleClick}
        />
  
        <button onClick={clearSelection}>Clear Selection</button>
      </div>
    );
  }
  
  function Heatmap(props) {
    React.useEffect(() => {
      if (props.data.length > 0 && props.options.breaks != undefined) {
        drawHeatmap(props);
      }
    });
  
    return <div className={props.name} />;
  }