export const getFieldDefinitions = (tableConfig, record?) => {
  const definitionObject = tableConfig.definition;

  // Convert the nested objects to an array
  const definitionArray = Object.values(definitionObject);

  const fields = Object.entries(tableConfig.fields ?? []);

  const formFields = definitionArray.map((field: { config: { name: string } }) => {
    const key = field.config.name;
    const fieldOverride = tableConfig.fields ? tableConfig.fields[key] : null;
    const fieldType = fieldOverride ? fieldOverride.type : "textField";

    if (record && record[key]) {
      return { key, type: fieldType, value: record[key] };
    } else {
      return { key, type: fieldType };
    }
  });

  tableConfig.formFields = formFields;
  // console.log("formFields", formFields);
  return tableConfig;
};
