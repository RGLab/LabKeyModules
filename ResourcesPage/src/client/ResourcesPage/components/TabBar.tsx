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
  activeTab: string;
}

interface IndicatorProps {
  left: number;
  width: number;
}

const TabBar: React.FC<TabBarProps> = ({
  tabInfo,
  onSelect,
  activeTab,
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
    const results: { [key: string]: React.RefObject<HTMLButtonElement> } = {};
    for (const info of tabInfo) {
      results[info.id] = React.createRef<HTMLButtonElement>();
    }
    return results;
  };

  const itemRefs = React.useRef<{
    [key: string]: React.RefObject<HTMLButtonElement>;
  }>(generateTabRefs(tabInfo)); //object of references, explained above
  const [indicatorProperties, setIndicatorProperties] =
    React.useState<IndicatorProps>({ left: 0, width: 0 });

  const activeTabId = React.useMemo(() => {
    for (const info of tabInfo) {
      if (info.tag === activeTab) {
        return info.id;
      }
    }
  }, [tabInfo, activeTab]);

  const tabBarItemOnClick = (index: number) => {
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
        activeTabId != null &&
        itemRefs.current[activeTabId] != null &&
        itemRefs.current[activeTabId].current != null
      ) {
        const selectedTab = itemRefs.current[activeTabId].current;
        setIndicatorProperties(calculateIndicatorProperties(selectedTab));
      }
    } else {
      setIndicatorProperties({
        left: 0,
        width: 0,
      });
    }
  }, [activeTabId]);

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
              selected={info.tag === activeTab}
              label={info.label}
              reference={itemRefs.current[info.id]}
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
