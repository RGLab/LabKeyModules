import {
  ANALYTE_TYPE_DISPLAY_TO_COLUMN,
  ANALYTE_TYPE_COLUMN_TO_DISPLAY,
} from "./constants";

export const capitalizeFirstLetter = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

export const convertDisplayToColumn = (type: string): string => {
  if (type === undefined) {
    return type;
  }
  return ANALYTE_TYPE_DISPLAY_TO_COLUMN[type];
};

export const convertColumnToDisplay = (type: string): string => {
  if (type === undefined) {
    return type;
  }
  return ANALYTE_TYPE_COLUMN_TO_DISPLAY[type];
};

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
