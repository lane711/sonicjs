//        Formio.builder(document.getElementById('builder'), {}, {});
var contentTypeComponents;
var route;
let mode;

(function () {
  const url = window.location.href;

  const params = url.split("/");
  route = window.location.href.split("/").pop();

  const authMode = url.includes("/auth/");
  if (authMode) {
    route = `auth/${route}`;
  }
  if (url.indexOf("admin/content/new") > 0) {
    mode = "new";
  } else if (url.indexOf("admin/content/edit") > 0) {
    mode = "edit";
  } else {
    mode = undefined;
  }
  if (!mode) {
    return;
  }

  if (mode == "edit") {
    editContent();
  }

  if (mode.includes("new")) {
    newContent();
  }
})();

const initUppy = async (edit) => {
  const { Uppy, Dashboard, Tus } = await import(
    "https://releases.transloadit.com/uppy/v3.21.0/uppy.min.mjs"
  );
  const uppy = new Uppy();
  uppy.use(Dashboard, {
    target: "#files-drag-drop",
    showProgressDetails: true,
  });
  uppy.use(Tus, {
    endpoint: "http://localhost:8786/tus",
    withCredentials: true,
    headers: {
      "sonic-mode": edit ? "update" : "create",
      "sonic-route": route,
    },
  });
  return uppy;
};
function newContent() {
  console.log("contentType", route);

  axios.get(`/v1/form-components/${route}`).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);

    const fileFields = response.data.filter((c) => c.metaType == "file");
    response.data = response.data.map((c) => {
      if (c.metaType == "file") {
        return {
          ...c,
          type: "button",
          action: "event",
          theme: "secondary",
        };
      } else {
        return c;
      }
    });
    Formio.icons = "fontawesome";
    // Formio.createForm(document.getElementById("formio"), {
    Formio.createForm(document.getElementById("formio"), {
      components: response.data,
    }).then(function (form) {
      let uppy;
      if (fileFields.length) {
        const formio = document.getElementById("formio");
        const childDiv = document.createElement("div");
        childDiv.id = "files-drag-drop";
        formio.parentNode.insertBefore(childDiv, formio);
        initUppy()
          .then((u) => {
            uppy = u;
          })
          .catch((e) => {
            console.log(e);
          });
      }
      form.on("submit", function (data) {
        saveNewContent(data);
      });
      form.on("change", async function (event) {
        $("#contentFormSaveButton").removeAttr("disabled");
        if (event.components) {
          contentTypeComponents = event.components;
          console.log("event ->", event);
        }
      });
      form.on("customEvent", function (event) {
        if (uppy) {
          console.log(uppy);
          const field = event.component.key || event.component.label;
          const tus = uppy.getPlugin("Tus");
          tus.opts.headers["sonic-field"] = field;
          const dashboard = uppy.getPlugin("Dashboard");
          if (!dashboard.isModalOpen()) {
            dashboard.openModal();
          }
        }
      });
    });
  });
}

function saveNewContent(data) {
  delete data.data.submit;
  delete data.data.id;
  console.log(data);

  axios.post(`/v1/${route}`, data).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    if (response.status === 200 || response.status === 201) {
      location.href = `/admin/tables/${route}`;
    }
  });
}
function editContent() {
  const contentId = $("#formio").attr("data-id");
  route = $("#formio").attr("data-route");
  console.log("contentType", contentId);
  const routeWithoutAuth = route.replaceAll("/auth/", "/");
  axios
    .get(`/v1/${routeWithoutAuth}/${contentId}?includeContentType`)
    .then((response) => {
      console.log(response.data);

      Formio.icons = "fontawesome";
      // debugger;
      // Formio.createForm(document.getElementById("formio"), {
      Formio.createForm(document.getElementById("formio"), {
        components: response.data.contentType,
      }).then(function (form) {
        form.on("submit", function ({ data }) {
          if (data.id) {
            updateContent(data);
          } else {
            addContent(data);
          }
        });
        form.submission = {
          data: response.data.data,
        };
        form.on("change", async function (event) {
          $("#contentFormSaveButton").removeAttr("disabled");
          if (event.components) {
            contentTypeComponents = event.components;
            console.log("event ->", event);
          }
        });
      });
    });
}

function addContent(data) {
  data.key = route;

  axios.post(`/v1/${route}`, data).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    if (response.status === 201 || response.status === 204) {
      location.href = "/admin";
    }
  });
}

function updateContent(data) {
  const id = data.id;
  var content = {};
  content.data = data;
  content.table = data.table;
  delete content.data.submit;
  delete content.data.contentType;
  delete content.data.id;
  delete content.data.table;
  route = $("#formio").attr("data-route");
  axios.put(`/v1/${route}/${id}`, content).then((response) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    if (response.status === 200) {
      location.href = `/admin/tables/${route}`;
    } else {
      alert("Error occured updating " + data.id);
    }
  });
}
