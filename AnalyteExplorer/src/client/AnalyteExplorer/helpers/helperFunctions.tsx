import {
  ANALYTE_TYPE_DISPLAY_TO_COLUMN,
  ANALYTE_TYPE_COLUMN_TO_DISPLAY,
} from "./constants";

export const capitalizeFirstLetter = (str: string): string => {
  if (str === undefined || str.length < 1) {
    return str;
  }
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

// convert the display name of the analyte type you see in the selector
// into the column names of the table
export const convertDisplayToColumn = (type: string): string => {
  if (type === undefined) {
    return type;
  }
  return ANALYTE_TYPE_DISPLAY_TO_COLUMN[type];
};

// convert the column name for the analyte type to the display name
// that you see in the selector
export const convertColumnToDisplay = (type: string): string => {
  if (type === undefined) {
    return type;
  }
  return ANALYTE_TYPE_COLUMN_TO_DISPLAY[type];
};

/**
 *
 * Recursive search that given a query and an array, return the index
 * of the element matching the query or if said
 * element doesn't exist, return the index of the next closest.
 *
 * @param query
 * @param array
 * @param left
 * @param right
 * @returns
 */
export const binaryClosestSearch = (
  query: string,
  array: { analyte_id: string; analyte_type: string }[],
  left: number,
  right: number
): number => {
  let result = -1;
  if (query === undefined || array.length < 1 || right - left < 0) {
    return result;
  }

  const middle = Math.floor(left + (right - left) / 2);

  if (query === array[middle]["analyte_id"]) {
    return middle;
  } else if (query > array[middle]["analyte_id"]) {
    result = binaryClosestSearch(query, array, middle + 1, right);
  } else if (query < array[middle]["analyte_id"]) {
    result = binaryClosestSearch(query, array, left, middle - 1);
  }

  if (result < 0) {
    if (array[middle]["analyte_id"].includes(query)) {
      return middle;
    }
  }
  return result;
};

// finds the average of an array of numbers
export const getAverage = (numArr: number[]): number => {
  if (numArr !== undefined && numArr !== null && numArr.length > 0) {
    let sum = 0;

    for (const num of numArr) {
      sum += num;
    }
    return sum / numArr.length;
  }
  return null;
};

export const capitalizeKebabCase = (str: string): string => {
  if (str === undefined || str.length < 0) {
    return str;
  }
  const strArr = str.split("-");
  for (let i = 0; i < strArr.length; i++) {
    strArr[i] = capitalizeFirstLetter(strArr[i]);
  }
  return strArr.join("-");
};

export const capitalizeEveryWord = (str: string): string => {
  if (str === undefined || str.length < 0) {
    return str;
  }
  const strArr = str.split(" ");
  for (let i = 0; i < strArr.length; i++) {
    strArr[i] = capitalizeFirstLetter(strArr[i]);
  }
  return strArr.join(" ");
};
