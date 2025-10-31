export const getDirtyFields = <
  TData extends
    | Partial<Record<keyof TDirtyItems, unknown>>
    | Partial<Record<keyof TDirtyItems, null>>,
  TDirtyItems extends Partial<Record<string, unknown>>,
>(
  formValues: TData,
  dirtyItems: TDirtyItems,
): Partial<TData> => {
  return Object.entries(dirtyItems).reduce((dirtyData, [key, value]) => {
    // react hook form considers removed array fields as dirty
    // so we need to check if the form value is not undefined
    const formValue = formValues?.[key];

    if (value === false) return dirtyData;
    if (value === true) return { ...dirtyData, [key]: formValue };
    if (!formValue) return formValues; // if the form value is not found, return the dirty data

    const child = getDirtyFields(
      formValues[key] as TData,
      dirtyItems[key] as TDirtyItems,
    );

    if (typeof child === "object" && Object.keys(child).length === 0) {
      return dirtyData;
    }

    // if the form value is an array, return the whole array
    if (Array.isArray(formValue)) {
      return {
        ...dirtyData,
        [key]: formValue,
      };
    }

    if (Array.isArray(child) && child.length === 0) {
      return dirtyData;
    }

    return {
      ...dirtyData,
      [key]: child,
    };
  }, {});
};
