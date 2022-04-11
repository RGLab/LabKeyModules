import React from "react";

interface TabBarItemProps {
  id: string;
  index: number;
  selected: boolean;
  label: string;
  reference: React.RefObject<HTMLButtonElement>;
  onClickCallback: (index: number) => void;
  color?: string;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  id,
  index,
  selected,
  label,
  reference,
  onClickCallback,
  color = "red",
}: TabBarItemProps) => {
  return (
    <button
      id={`${id}-tab`}
      className={`immunespace-tabbar__item ${
        selected ? "is-tabbar-selected" : ""
      }`}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`${id}-panel`}
      tabIndex={selected ? 0 : -1}
      ref={reference}
      onClick={() => onClickCallback(index)}>
      {label}
    </button>
  );
};

interface TabInfo {
  id: string;
  tag: string;
  label: string;
}

interface TabBarProps {
  tabInfo: TabInfo[];
  onSelect: (value: string) => void;
}

interface IndicatorProps {
  left: number;
  width: number;
}

const TabBar: React.FC<TabBarProps> = ({
  tabInfo,

  onSelect,
}: TabBarProps) => {
  const itemRefs = React.useRef<React.RefObject<HTMLButtonElement>[]>([]); //array of references
  const [selected, setSelected] = React.useState(0);
  const [indicatorProperties, setIndicatorProperties] =
    React.useState<IndicatorProps>({ left: 0, width: 0 });

  itemRefs.current = React.useMemo(() => {
    return tabInfo.map(
      (_, i) => itemRefs.current[i] ?? React.createRef<HTMLButtonElement>()
    );
  }, [tabInfo]);

  const tabBarItemOnClick = (index: number) => {
    console.log(itemRefs.current[0].current.offsetLeft);
    setSelected(index);
    onSelect(tabInfo[index].tag);
  };

  React.useEffect(() => {
    if (itemRefs.current[selected].current != null) {
      const selectedTab = itemRefs.current[selected].current;
      const selectedTabWidth = selectedTab.offsetWidth;
      const selectedTabXPos = selectedTab.offsetLeft;
      setIndicatorProperties({
        left: selectedTabXPos,
        width: selectedTabWidth,
      });
    }
  }, [selected]);

  return (
    <div className="immunespace-tabbar">
      <div className="immunespace-tabbar__tabContainer">
        {tabInfo.map((info, i) => {
          return (
            <TabBarItem
              key={info.id}
              id={info.id}
              index={i}
              selected={i === selected}
              label={info.label}
              reference={itemRefs.current[i]}
              onClickCallback={tabBarItemOnClick}
            />
          );
        })}
      </div>

      <span
        className="immunespace-tabbar__indicator"
        style={{
          left: `${indicatorProperties.left}px`,
          width: `${indicatorProperties.width}px`,
        }}></span>
    </div>
  );
};

export default TabBar;
