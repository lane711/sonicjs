(function () {
  const url = window.location.href;
  const loginForm = document.getElementById("formio-login");
  console.log(loginForm);
  if (url.includes("/login") && loginForm) {
    Formio.createForm(loginForm, {
      components: [
        {
          type: "textfield",
          key: "email",
          label: "Email",
          placeholder: "Enter your email.",
          input: true,
        },
        {
          type: "password",
          key: "password",
          label: "Password",
          placeholder: "Enter your password",
          input: true,
        },
        {
          type: "button",
          action: "submit",
          label: "Log in",
          theme: "primary",
        },
      ],
    }).then(function (form) {
      form.on("submit", function (data) {
        axios
          .post(`/v1/auth/login`, data?.data)
          .then((response) => {
            document.getElementById("login-errors").innerHTML = "";
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
            location.href = "/admin";
          })
          .catch((error) => {
            document.getElementById("login-errors").innerHTML =
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
})();
