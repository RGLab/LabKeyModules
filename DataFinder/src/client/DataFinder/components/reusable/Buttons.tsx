import * as React from 'react';
import "./Buttons.scss"

interface HighlightedButtonProps {
    action?: () => void;
    href?: string;
    id?: string;
}

interface RowOfButtonProps {
    id?: string;
}


// Button or link with highlighted style
export const HighlightedButton: React.FC<HighlightedButtonProps> = ({href, action, id, children}) => {
    return <a href={href} className="btn df-highlighted-button" onClick={action} id={id}>
        {children}
    </a>;
  };

// export const HighlightedButton = React.memo(HighlightedButtonFC)


// Floats all children in a nice little row
export const RowOfButtons: React.FC<RowOfButtonProps> = ({children, id}) => {
    return <div className={"df-row-of-buttons"} id={id}>
    {React.Children.map(children || null, (child, i) => {
        return (
            <div style={{float: "left", padding: "3px 10px"}}>
                {child}
            </div>
            )
        })}
    </div>
}