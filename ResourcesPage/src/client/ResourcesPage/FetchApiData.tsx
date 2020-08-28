interface Props {
    apiBase: string;
    fileSuffix: string;
    setData: (data) => void;
    setErrors: (errors) => void;
}

export const fetchApiData = async (props: Props) => {
    fetch(props.apiBase + props.fileSuffix)
        .then(response => response.json())
        .then(data => props.setData(data))
        .catch(errors => props.setErrors(errors));
    
}