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
  /**
   * Creates a reference for every item of the tab bar and stores that array of references in
   * another reference.
   *
   * Since the ".current" property of a React reference object is a plain, mutable javasript object, it can be used to store any value,
   * even other React reference objects. The .current of a React reference object also persists across the entire lifetime of the component.
   *
   */
  const generateTabRefs = (tabInfo: TabInfo[]) => {
    return tabInfo.map(() => React.createRef<HTMLButtonElement>());
  };

  const itemRefs = React.useRef<React.RefObject<HTMLButtonElement>[]>(
    generateTabRefs(tabInfo)
  ); //array of references, explained above
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
        data-testid="tabbar_indicator"
        className="immunespace-tabbar__indicator"
        style={{
          left: `${indicatorProperties.left}px`,
          width: `${indicatorProperties.width}px`,
        }}></span>
    </div>
  );
};

export default TabBar;
