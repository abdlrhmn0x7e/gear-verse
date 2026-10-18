const hasDirtyField = (dirty: unknown): boolean => {
  if (dirty === true) return true;
  if (typeof dirty !== "object" || dirty === null) return false;

  return Object.values(dirty).some(hasDirtyField);
};

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
    const formValue = formValues?.[key];

    if (value === false || value === undefined) return dirtyData;
    if (value === true) return { ...dirtyData, [key]: formValue };

    // arrays are always sent whole. react hook form keeps dirty entries for
    // removed items, so a dirty array longer than the form value lost items,
    // and removing every item has to be sent as an empty array
    if (Array.isArray(formValue)) {
      const removedItems =
        Array.isArray(value) && value.length > formValue.length;

      if (removedItems || hasDirtyField(value)) {
        return { ...dirtyData, [key]: formValue };
      }

      return dirtyData;
    }

    // the form value was cleared, there is nothing left to diff against
    if (typeof formValue !== "object" || formValue === null) {
      return hasDirtyField(value)
        ? { ...dirtyData, [key]: formValue }
        : dirtyData;
    }

    const child = getDirtyFields(
      formValue as TData,
      value as Partial<Record<string, unknown>>,
    );

    if (Object.keys(child).length === 0) {
      return dirtyData;
    }

    return {
      ...dirtyData,
      [key]: child,
    };
  }, {});
};
