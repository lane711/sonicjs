import { apiConfig } from "../../db/routes";
import { AppContext, Variables } from "../../server";
import { getSchemaFromTable } from "../data/d1-data";

export function getForm(ctx: AppContext, table) {
  let formFields = [];

  //TODO: amke dynamic
  // const schema = `${table}Schema`;
  console.log("table", table);
  const schema = getSchemaFromTable(table);
  console.log("schema", schema);
  const config = apiConfig.find((tbl) => tbl.table === table);

  for (var field in schema) {
    const formField = getField(field);
    const metaType = config.fields?.[field]?.type || "auto";
    formField.metaType = metaType;
    if (formField.metaType === "auto") {
      delete formField.metaType;
    }
    formFields.push(formField);
  }

  const user = ctx.get("user");
  if (user && user.userId) {
    const hasUserId = formFields.find((f) => f.key === "userId");
    if (hasUserId) {
      formFields = formFields.map((f) => {
        if (f.key === "userId") {
          f.disabled = true;
          f.defaultValue = user.userId;
        }
        return f;
      });
    }
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
    metaType: "auto",
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
