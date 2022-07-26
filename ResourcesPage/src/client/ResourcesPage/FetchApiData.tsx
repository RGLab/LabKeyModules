interface Props {
  apiBase: string;
  fileSuffix: string;
  setData: (data) => void;
  setErrors: (errors: string) => void;
}

export const fetchApiData = async (props: Props): Promise<void> => {
  fetch(props.apiBase + props.fileSuffix)
    .then((response) => {
      if (response.status !== 200) {
        throw "Error: Unable to retrieve data. Please try again later. ";
      }
      return response.json();
    })
    .then((data) => {
      props.setData(data);
    })
    .catch((errors) => {
      if (errors instanceof Error) {
        props.setErrors(errors.message);
      } else {
        props.setErrors(String(errors));
      }
    });
};
