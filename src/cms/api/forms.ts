import { apiConfig } from '../../db/routes';
import { AppContext } from '../../server';
import { getSchemaFromTable } from '../data/d1-data';
import { singularize } from '../util/utils';

export function getForm(ctx: AppContext, table) {
  let formFields: {
    type: string;
    key?: string;
    label: string;
    action?: string;
    defaultValue?: string;
    disabled?: boolean;
  }[] = [];

  //TODO: amke dynamic
  // const schema = `${table}Schema`;

  const schema = getSchemaFromTable(table);
  const config = apiConfig.find((tbl) => tbl.table === table);
  for (var field in schema) {
    let formField = getField(field);
    const metaType = config.fields?.[field]?.type || 'auto';
    formField.metaType = metaType;
    if (formField.metaType === 'auto') {
      delete formField.metaType;
    } else if (
      formField.metaType.includes('[]') &&
      formField.metaType !== 'file[]'
    ) {
      const c = formField;
      formField = {
        type: 'datagrid',
        label: c.label || c.key,
        key: c.key,
        components: [
          {
            ...c,
            key: `${c.key}`,
            label: singularize(c.label || c.key)
          }
        ]
      };
    } else if (formField.metaType == 'ckeditor') {
      const c = formField;
      formField = {
        label: c.label || c.key,
        editor: 'ckeditor',
        customClass: 'pl-4 pr-4',
        tableView: true,
        key: c.key,
        type: 'textarea',
        input: true,
        isUploadEnabled: false
      };
    } else if (formField.metaType == 'quill') {
      const c = formField;
      formField = {
        label: c.label || c.key,
        editor: 'quill',
        customClass: 'pl-4 pr-4',
        tableView: true,
        key: c.key,
        type: 'textarea',
        rows: 3,
        input: true,
        isUploadEnabled: false
      };
    }
    formFields.push(formField);
  }

  const user = ctx.get('user');
  if (user && user.userId) {
    const hasUserId = formFields.find((f) => f.key === 'userId');
    if (hasUserId) {
      formFields = formFields.map((f) => {
        if (f.key === 'userId') {
          f.disabled = true;
          f.defaultValue = user.userId;
        }
        return f;
      });
    }
  }

  //table reference
  formFields.push({
    type: 'textfield',
    key: 'table',
    label: 'table',
    defaultValue: table,
    disabled: true
  });

  //submit button
  formFields.push({
    type: 'button',
    action: 'submit',
    label: 'Save'
  });

  return formFields;
}
interface Field {
  type: string;
  key: string;
  label: string;
  metaType?: string;
  disabled?: boolean;
  placeholder?: string;
  input?: boolean;
  tooltip?: string;
  description?: string;
  components?: Field[];
}

function getField(fieldName): Field {
  const disabled = fieldName == 'id';
  return {
    type: getFieldType(fieldName),
    key: fieldName,
    label: fieldName,
    disabled
    // placeholder: "Enter your first name.",
    // input: true,
    // tooltip: "Enter your <strong>First Name</strong>",
    // description: "Enter your <strong>First Name</strong>",
  };
}

function getFieldType(fieldName) {
  return fieldName === 'password' ? 'password' : 'textfield';
}
