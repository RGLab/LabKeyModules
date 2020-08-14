import * as React from "react";

interface props {
    apiBase: string;
    fileSuffix: string;
    setData: function;
    setErrors: function;
}

export const fetchApiData = React.memo<props>(( { apiBase, fileSuffix, setData, setErrors }: props) => {
    const res = await fetch(apiBase + fileSuffix);
    res
        .json()
        .then(res => setData(res))
        .catch(err => setErrors(err));
}