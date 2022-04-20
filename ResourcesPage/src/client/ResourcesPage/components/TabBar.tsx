import React from "react";

interface TabBarItemProps {
  id: string;
  index: number;
  selected: boolean;
  label: string;
  reference: React.RefObject<HTMLButtonElement>;
  onClickCallback: (index: number) => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  id,
  index,
  selected,
  label,
  reference,
  onClickCallback,
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
  defaultTab: string;
}

interface IndicatorProps {
  left: number;
  width: number;
}

const TabBar: React.FC<TabBarProps> = ({
  tabInfo,
  onSelect,
  defaultTab,
}: TabBarProps) => {
  const itemRefs = React.useRef<React.RefObject<HTMLButtonElement>[]>([]); //array of references
  const [selected, setSelected] = React.useState<number>(null);
  const [indicatorProperties, setIndicatorProperties] =
    React.useState<IndicatorProps>({ left: 0, width: 0 });

  const defaultSelected = React.useMemo(() => {
    for (let i = 0; i < tabInfo.length; i++) {
      if (tabInfo[i].tag === defaultTab) {
        return i;
      }
    }
    return 0;
  }, [defaultTab, tabInfo]);
  //console.log(`${defaultSelected} ${selected}`);

  itemRefs.current = React.useMemo(() => {
    return tabInfo.map(
      (_, i) => itemRefs.current[i] ?? React.createRef<HTMLButtonElement>()
    );
  }, [tabInfo]);

  const tabBarItemOnClick = (index: number) => {
    setSelected(index);
    onSelect(tabInfo[index].tag);
  };

  React.useEffect(() => {
    const calculateIndicatorProperties = (selectedTab: HTMLButtonElement) => {
      return {
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      };
    };

    if (itemRefs != null && itemRefs.current != null) {
      if (
        selected == null &&
        itemRefs.current[defaultSelected] != null &&
        itemRefs.current[defaultSelected].current != null
      ) {
        const selectedTab = itemRefs.current[defaultSelected].current;
        setIndicatorProperties(calculateIndicatorProperties(selectedTab));
      } else if (
        selected != null &&
        itemRefs.current[selected] != null &&
        itemRefs.current[selected].current != null
      ) {
        const selectedTab = itemRefs.current[selected].current;
        setIndicatorProperties(calculateIndicatorProperties(selectedTab));
      }
    } else {
      setIndicatorProperties({
        left: 0,
        width: 0,
      });
    }
  }, [selected, defaultSelected]);

  return (
    <div className="immunespace-tabbar">
      <div
        className="immunespace-tabbar__tabContainer"
        role="tablist"
        aria-label="resources page tabs">
        {tabInfo.map((info, i) => {
          return (
            <TabBarItem
              key={info.id}
              id={info.id}
              index={i}
              selected={i === (selected ?? defaultSelected)}
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
