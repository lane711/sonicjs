//        Formio.builder(document.getElementById('builder'), {}, {});
var contentTypeComponents;

(function () {
  const url = window.location.href;
  var mode;

  if (url.indexOf('admin/content-type/new') > 0) {
    mode = 'new';
  }

  if (url.indexOf('admin/content-type/edit') > 0) {
    mode = 'edit';
  }

  if (!mode) {
    return;
  }

  if (mode == 'edit') {
    editContentType();
  }

  if (mode == 'new') {
    newContentType();
  }
})();

function editContentType() {
  const contentType = window.location.href.split('/').pop();
  console.log('contentType', contentType);

  axios.get(`/v1/form-components/${contentType}`).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);

    Formio.icons = 'fontawesome';
    // Formio.createForm(document.getElementById("formio"), {
    Formio.builder(document.getElementById('formio'), {
      components: response.data
    }).then(function (form) {
      form.on('submit', function (submission) {
        console.log(submission);
      });
      form.on('change', async function (event) {
        $('#contentFormSaveButton').removeAttr('disabled');
        if (event.components) {
          contentTypeComponents = event.components;
          console.log('event ->', event);
        }
      });
    });
  });
}

function newContentType() {
  const newComponents = [
    {
      label: 'System Id',
      labelPosition: 'top',
      placeholder:
        'Edit the default value of this field with a value that it lowercase with dashes, ie: blog-post, blog-settings',
      description: '',
      tooltip: '',
      prefix: '',
      suffix: '',
      widget: {
        type: 'input'
      },
      inputMask: '',
      displayMask: '',
      allowMultipleMasks: false,
      customClass: '',
      tabindex: '',
      autocomplete: '',
      hidden: false,
      hideLabel: false,
      showWordCount: false,
      showCharCount: false,
      mask: false,
      autofocus: false,
      spellcheck: true,
      disabled: false,
      tableView: true,
      modalEdit: false,
      multiple: false,
      persistent: true,
      inputFormat: 'plain',
      protected: false,
      dbIndex: false,
      case: '',
      truncateMultipleSpaces: false,
      encrypted: false,
      redrawOn: '',
      clearOnHide: true,
      customDefaultValue: '',
      calculateValue: '',
      calculateServer: false,
      allowCalculateOverride: false,
      validateOn: 'change',
      validate: {
        required: true,
        pattern: '',
        customMessage: '',
        custom: '',
        customPrivate: false,
        json: '',
        minLength: '',
        maxLength: '',
        strictDateValidation: false,
        multiple: false,
        unique: false
      },
      unique: false,
      errorLabel: '',
      errors: '',
      key: 'systemId',
      tags: [],
      properties: {},
      conditional: {
        show: null,
        when: null,
        eq: '',
        json: ''
      },
      customConditional: '',
      logic: [],
      attributes: {},
      overlay: {
        style: '',
        page: '',
        left: '',
        top: '',
        width: '',
        height: ''
      },
      type: 'textfield',
      input: true,
      refreshOn: '',
      dataGridLabel: false,
      addons: [],
      inputType: 'text',
      id: 'systemIdComponent',
      defaultValue: ''
    },
    {
      label: 'Title',
      labelPosition: 'top',
      placeholder: '',
      description: '',
      tooltip: '',
      prefix: '',
      suffix: '',
      widget: {
        type: 'input'
      },
      inputMask: '',
      displayMask: '',
      allowMultipleMasks: false,
      customClass: '',
      tabindex: '',
      autocomplete: '',
      hidden: false,
      hideLabel: false,
      showWordCount: false,
      showCharCount: false,
      mask: false,
      autofocus: false,
      spellcheck: true,
      disabled: false,
      tableView: true,
      modalEdit: false,
      multiple: false,
      persistent: true,
      inputFormat: 'plain',
      protected: false,
      dbIndex: false,
      case: '',
      truncateMultipleSpaces: false,
      encrypted: false,
      redrawOn: '',
      clearOnHide: true,
      customDefaultValue: '',
      calculateValue: '',
      calculateServer: false,
      allowCalculateOverride: false,
      validateOn: 'change',
      validate: {
        required: true,
        pattern: '',
        customMessage: '',
        custom: '',
        customPrivate: false,
        json: '',
        minLength: '',
        maxLength: '',
        strictDateValidation: false,
        multiple: false,
        unique: false
      },
      unique: false,
      errorLabel: '',
      errors: '',
      key: 'title',
      tags: [],
      properties: {},
      conditional: {
        show: null,
        when: null,
        eq: '',
        json: ''
      },
      customConditional: '',
      logic: [],
      attributes: {},
      overlay: {
        style: '',
        page: '',
        left: '',
        top: '',
        width: '',
        height: ''
      },
      type: 'textfield',
      input: true,
      refreshOn: '',
      dataGridLabel: false,
      addons: [],
      inputType: 'text',
      id: 'elreiuy',
      defaultValue: ''
    },
    {
      type: 'button',
      label: 'Submit',
      key: 'submit',
      size: 'md',
      block: false,
      action: 'submit',
      disableOnInvalid: true,
      theme: 'primary',
      input: true,
      placeholder: '',
      prefix: '',
      customClass: '',
      suffix: '',
      multiple: false,
      defaultValue: null,
      protected: false,
      unique: false,
      persistent: false,
      hidden: false,
      clearOnHide: true,
      refreshOn: '',
      redrawOn: '',
      tableView: false,
      modalEdit: false,
      dataGridLabel: true,
      labelPosition: 'top',
      description: '',
      errorLabel: '',
      tooltip: '',
      hideLabel: false,
      tabindex: '',
      disabled: false,
      autofocus: false,
      dbIndex: false,
      customDefaultValue: '',
      calculateValue: '',
      calculateServer: false,
      widget: {
        type: 'input'
      },
      attributes: {},
      validateOn: 'change',
      validate: {
        required: false,
        custom: '',
        customPrivate: false,
        strictDateValidation: false,
        multiple: false,
        unique: false
      },
      conditional: {
        show: null,
        when: null,
        eq: ''
      },
      overlay: {
        style: '',
        left: '',
        top: '',
        width: '',
        height: ''
      },
      allowCalculateOverride: false,
      encrypted: false,
      showCharCount: false,
      showWordCount: false,
      properties: {},
      allowMultipleMasks: false,
      addons: [],
      leftIcon: '',
      rightIcon: '',
      id: 'ez1aarp'
    }
  ];
  Formio.icons = 'fontawesome';
  // Formio.createForm(document.getElementById("formio"), {
  Formio.builder(document.getElementById('formio'), {
    components: newComponents
  }).then(function (form) {
    form.on('submit', function (submission) {
      console.log(submission);
    });
    form.on('change', async function (event) {
      $('#contentFormSaveButton').removeAttr('disabled');
      if (event.components) {
        contentTypeComponents = event.components;
        console.log('event ->', event);
      }
    });
  });
}

function onContentFormSave() {
  console.log('saving content type');
  console.log(contentTypeComponents);

  axios.post('/v1/form-components', contentTypeComponents).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    if (response.status === 200 || response.status === 201) {
      location.href = '/admin/content-types';
    }
  });
}
