
const getLocalStorage = () => {
    if (typeof(Storage) !== "undefined") {
        return(localStorage)
    } else {
        return(
            {
            getItem: () => "",
            setItem: () => ""
        })
    }
}

let LS: any = getLocalStorage()


export default LS