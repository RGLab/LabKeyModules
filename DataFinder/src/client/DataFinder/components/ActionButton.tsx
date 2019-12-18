import * as React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    text: string;
}

export const ActionButton: React.FC<ActionButtonProps> = (props) => {
    return(
        <button onClick={props.onClick}>
            {props.text}
        </button>
    )
}