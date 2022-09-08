import * as React from "react";

interface TOCItem {
  name: string;
  link: string;
}

export interface TOCProps {
  title: string;
  content: TOCItem[];
}
export const TableOfContents: React.FC<TOCProps> = ({
  title,
  content,
}: TOCProps) => {
  return (
    <div className="toc">
      <span className="toc__title">{title}</span>
      <div className="toc__content">
        <ul>
          {content.map((item, i) => {
            return (
              <li key={`${item.name}-${i}`}>
                <a href={item.link} className="toc__link">
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

interface AnchorHeadingProps {
  text: string;
  anchorID: string;
}
export const AnchorHeading: React.FC<AnchorHeadingProps> = ({
  text,
  anchorID,
}: AnchorHeadingProps) => {
  return (
    <div className="plot-area__title">
      <h1 id={anchorID}>{text}</h1>
      <a href={`#${anchorID}`} className="anchor-link">
        <img
          src="/ResourcesPage/icons/web-hyperlink.svg"
          alt={text}
          className="link-icon"
        />
      </a>
    </div>
  );
};

export interface PlotMenuSpecs {
  id: string;
  name: string;
  options: { id: string; value: string; label: string }[];
}

interface PlotMenuComponentProps extends PlotMenuSpecs {
  onClickCallback: (item: string) => void;
}

export const PlotMenu: React.FC<PlotMenuComponentProps> = ({
  name,
  options,
  onClickCallback,
}: PlotMenuComponentProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const dropdownRef = React.useRef(null);
  const dropdownButtonRef = React.useRef(null);

  // the dropdown menu closes when you click outside the dropdown menu OR on the dropdown menu itself
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        dropdownButtonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, dropdownButtonRef]);

  // WIP
  return (
    <div className="plot-dropdown-menu">
      <div
        className={`plot-dropdown-menu__button ${isOpen ? "clicked" : ""}`}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        ref={dropdownButtonRef}>
        <span className="dropdown-name">{name}</span>
        <img
          className="dropdown-icon"
          src="/ResourcesPage/icons/arrow_drop_down.svg"
          alt="dropdown"
        />
      </div>

      <div
        className="plot-dropdown-menu__dropdown"
        ref={dropdownRef}
        hidden={!isOpen}>
        <ul role="listbox">
          {options.map((option) => {
            return (
              <li
                key={option.value}
                onClick={() => {
                  setIsOpen(!isOpen);
                  onClickCallback(option.id);
                }}>
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
