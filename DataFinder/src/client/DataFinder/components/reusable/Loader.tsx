import React from 'react'
import './Loader.scss'

interface LoaderProps {
    id?: string;
}

export const Loader: React.FC<LoaderProps> = ({id}) => {
    return <div id={id}>
        <div className="loader"></div>
    </div>
}