(function () {
  const url = window.location.href;
  const loginForm = document.getElementById('formio-login');
  if (url.includes('/login') && loginForm) {
    Formio.createForm(loginForm, {
      components: [
        {
          type: 'textfield',
          key: 'email',
          label: 'Email',
          placeholder: 'Enter your email.',
          input: true
        },
        {
          type: 'password',
          key: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          input: true
        },
        {
          type: 'button',
          action: 'submit',
          label: 'Log in',
          theme: 'primary'
        }
      ]
    }).then(function (form) {
      form.on('submit', function (data) {
        axios
          .post(`/v1/auth/login`, data?.data)
          .then((response) => {
            document.getElementById('login-errors').innerHTML = '';
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
            location.href = '/admin';
          })
          .catch((error) => {
            document.getElementById('login-errors').innerHTML =
              error.response.data;
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.statusText);
            console.log(error.response.headers);
            console.log(error.response.config);
          });
      });
    });
  } else if (url.includes('auth/users/setup')) {
    const setupForm = document.getElementById('formio-setup');
    if (setupForm) {
      Formio.createForm(setupForm, {
        components: [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'First Name',
            input: true
          },
          {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Last Name',
            input: true
          },
          {
            type: 'textfield',
            key: 'email',
            label: 'Email',
            placeholder: 'Enter your email.',
            input: true
          },
          {
            type: 'password',
            key: 'password',
            label: 'Password',
            placeholder: 'Enter your password',
            input: true
          },
          {
            type: 'password',
            key: 'confirmPassword',
            label: 'Confirm Password',
            placeholder: 'Enter your password again',
            input: true
          },
          {
            type: 'button',
            action: 'submit',
            label: 'Submit'
          }
        ]
      }).then(function (form) {
        form.on('submit', function (data) {
          document.getElementById('setup-errors').innerHTML = '';
          if (data?.data?.password !== data?.data?.confirmPassword) {
            document.getElementById('setup-errors').innerHTML =
              'Password and Confirm Password do not match';
            return;
          }
          axios
            .post(`/v1/auth/users/setup`, data)
            .then((response) => {
              console.log(response.data);
              console.log(response.status);
              console.log(response.statusText);
              console.log(response.headers);
              console.log(response.config);
              location.href = '/admin/login';
            })
            .catch((error) => {
              document.getElementById('setup-errors').innerHTML =
                error.response.data;
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.statusText);
              console.log(error.response.headers);
              console.log(error.response.config);
            });
        });
      });
    }
  }
})();
