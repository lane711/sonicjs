import { userSchema, postsSchema } from "../../db/schema";
import { getSchemaFromTable } from "../data/d1-data";

export function getForm(ctx, table) {
  let formFields = [];

  //TODO: amke dynamic
  // const schema = `${table}Schema`;
  const schema = getSchemaFromTable(table);

  for (var field in schema) {
    const formField = getField(field);
    formFields.push(formField);
  }

  //table reference
  formFields.push({
    type: "textfield",
    key: "table",
    label: "table",
    defaultValue: table,
    disabled: true,
  });

  //submit button
  formFields.push({
    type: "button",
    action: "submit",
    label: "Save",
    theme: "primary",
  });

  return formFields;
}

function getField(fieldName) {
  const disabled = fieldName == "id";
  return {
    type: getFieldType(fieldName),
    key: fieldName,
    label: fieldName,
    disabled,
    // placeholder: "Enter your first name.",
    // input: true,
    // tooltip: "Enter your <strong>First Name</strong>",
    // description: "Enter your <strong>First Name</strong>",
  };
}

function getFieldType(fieldName) {
  return fieldName === "password" ? "password" : "textfield";
}
