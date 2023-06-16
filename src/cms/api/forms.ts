import { userSchema } from "../../db/schema";

export function getForm(ctx, table) {
  let formFields = [];
  for (var field in userSchema) {
    const formField = getField(field)
    formFields.push(formField);
  }

  //table reference
  formFields.push({
    type: "textfield",
    key: "table",
    label: "table",
    defaultValue: table,
    disabled: true
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

function getField(fieldName){
return {
    type: getFieldType(fieldName),
    key: fieldName,
    label: fieldName,
    // placeholder: "Enter your first name.",
    // input: true,
    // tooltip: "Enter your <strong>First Name</strong>",
    // description: "Enter your <strong>First Name</strong>",
  };
}

function getFieldType(fieldName){
    return fieldName === 'password' ? 'password' : 'textfield'
}
