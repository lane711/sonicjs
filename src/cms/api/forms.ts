import { apiConfig } from '../../db/routes';
import { AppContext } from '../../server';
import { getRelationsFromTable, getSchemaFromTable } from '../data/d1-data';
import { singularize } from '../util/utils';
import { createTableRelationsHelpers } from 'drizzle-orm';
interface Field {
  type: string;
  key?: string;
  label: string;
  metaType?: string;
  disabled?: boolean;
  placeholder?: string;
  input?: boolean;
  tooltip?: string;
  description?: string;
  action?: string;
  defaultValue?: string;
  editor?: string;
  customClass?: string;
  tableView?: boolean;
  rows?: number;
  isUploadEnabled?: boolean;
  relation?: {
    table: string;
    fields: string[];
    references: string[];
    many: boolean;
  };
  components?: Field[];
}

export function getForm(ctx: AppContext, table) {
  let formFields: Field[] = [];

  //TODO: amke dynamic
  // const schema = `${table}Schema`;

  const schema = getSchemaFromTable(table);
  const relation = getRelationsFromTable(table);
  const relationsConfig = relation?.config(
    createTableRelationsHelpers(relation.table)
  );

  const config = apiConfig.find((tbl) => tbl.table === table);
  if (relationsConfig) {
    const manyRelationKeys = Object.keys(relationsConfig).filter((key) => {
      const relation = relationsConfig[key];
      return relation?.constructor.name === '_Many';
    });
  }

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

    if (relationsConfig) {
      const fieldRelationKey = Object.keys(relationsConfig).find((key) => {
        const relation = relationsConfig[key];
        if (relation?.config?.fields) {
          const fields = relation.config.fields;
          return fields.find((f) => f.name === formField.key);
        }
      });
      if (fieldRelationKey) {
        const fieldRelation = relationsConfig[fieldRelationKey];
        formField.relation = {
          table: fieldRelation.referencedTableName as string,
          many: fieldRelation.constructor.name === '_Many',
          fields: fieldRelation.config.fields.map((f) => f.name),
          references: fieldRelation.config.references.map((f) => f.name)
        };
      }
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
function getField(fieldName): Field {
  const disabled = fieldName == 'id';
  return {
    type: getFieldType(fieldName),
    key: fieldName,
    label: fieldName,
    disabled
  };
}

function getFieldType(fieldName) {
  return fieldName === 'password' ? 'password' : 'textfield';
}
