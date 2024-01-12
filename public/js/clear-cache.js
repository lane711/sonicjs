//        Formio.builder(document.getElementById('builder'), {}, {});
var contentTypeComponents;
var route;

(function () {
  const url = window.location.href;

  const params = url.split("/");
  route = window.location.href.split("/").pop();

  var mode;

  if (url.indexOf("/admin/cache/clear") > 0) {
    loadForm();
  }
})();

function loadForm() {
  Formio.icons = "fontawesome";

  Formio.createForm(document.getElementById("formio-clear-cache"), {
    components: [
      {
        type: "checkbox",
        key: "inMemory",
        label: "Clear In Memory",
        defaultValue: true,
      },
      {
        type: "checkbox",
        key: "kv",
        label: "Clear KV",
        defaultValue: true,
      },
      {
        type: "checkbox",
        key: "keys",
        label: "Clear Keys (Not Recommended)",
      },
      {
        type: "button",
        key: "submit",
        label: "Clear",
      },
    ],
  }).then(function (form) {
    form.on("submit", function (data) {

        data.key = route;
      
        axios.post(`/v1/cache/clear-all`, data).then((response) => {
          console.log(response.data);
          console.log(response.status);
          console.log(response.statusText);
          console.log(response.headers);
          console.log(response.config);
          if (response.status === 201 || response.status === 204) {
            location.href = "/admin";
            alert("ok");

          }
        });
      

    });
  });

  // Formio.createForm(document.getElementById("formio"), {
  //   components: response.data,
  // }).then(function (form) {
  //   form.on("submit", function (data) {
  //     saveNewContent(data);
  //   });
  //   form.on("change", async function (event) {
  //     $("#contentFormSaveButton").removeAttr("disabled");
  //     if (event.components) {
  //       contentTypeComponents = event.components;
  //       console.log("event ->", event);
  //     }
  //   });
  // });
}
