import * as React from 'react';

interface HighlightedButtonProps {
    label: string;
    action?: () => void;
    href?: string;
    id?: string;
}


// Button or link with highlighted style
const HighlightedButtonFC: React.FC<HighlightedButtonProps> = (({label, href, action, id}) => {
    return <a href={href} className="btn df-highlighted-button" onClick={action} id={id}>
        {label}
    </a>;
  });

export const HighlightedButton = React.memo(HighlightedButtonFC)


// Floats all children in a nice little row
export const RowOfButtons: React.FC = ({children}) => {
    return <div className={"df-row-of-buttons"}>
    {React.Children.map(children || null, (child, i) => {
        return (
            <div style={{float: "left", padding: "3px 10px"}}>
                {child}
            </div>
            )
        })}
    </div>
}