import * as React from 'react';
import {drawHeatmap} from "./d3/HeatmapSelector"

// React stuff ==================================== //

export function AssayTpHeatmap(props) {
    const [selected, setSelected] = React.useState([]);

    function handleClick(id) {
      var tmp = selected.slice();
      if (selected.includes(id)) {
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
          options={props.options}
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