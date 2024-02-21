export function loadForm(id) {
  return `
    <html>
  <head>
    <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
    <link rel='stylesheet' href='https://cdn.form.io/formiojs/formio.full.min.css'>
    <script src='https://cdn.form.io/formiojs/formio.full.min.js'></script>
    <script type='text/javascript'>
      window.onload = function() {
        Formio.builder(document.getElementById('builder'), {}, {});
      };
    </script>
  </head>
  <body>
    <div id='builder'></div>
  </body>
</html>
    `;
}

export async function getForm() {
  return [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'ABC First Name',
      placeholder: 'Enter your first name.',
      input: true,
      tooltip: 'Enter your <strong>First Name</strong>',
      description: 'Enter your <strong>First Name</strong>'
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      input: true,
      tooltip: 'Enter your <strong>Last Name</strong>',
      description: 'Enter your <strong>Last Name</strong>'
    },
    {
      type: 'select',
      label: 'Favorite Things',
      key: 'favoriteThings',
      placeholder: 'These are a few of your favorite things...',
      data: {
        values: [
          {
            value: 'raindropsOnRoses',
            label: 'Raindrops on roses'
          },
          {
            value: 'whiskersOnKittens',
            label: 'Whiskers on Kittens'
          },
          {
            value: 'brightCopperKettles',
            label: 'Bright Copper Kettles'
          },
          {
            value: 'warmWoolenMittens',
            label: 'Warm Woolen Mittens'
          }
        ]
      },
      dataSrc: 'values',
      template: '<span>{{ item.label }}</span>',
      multiple: true,
      input: true
    },
    {
      type: 'button',
      action: 'submit',
      label: 'Submit',
      theme: 'primary'
    }
  ];
}
