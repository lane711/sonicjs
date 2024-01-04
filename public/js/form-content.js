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

let currUppyField = "";

const initUppy = async (id) => {
  const { Uppy, Dashboard, Tus } = await import(
    "https://releases.transloadit.com/uppy/v3.21.0/uppy.min.mjs"
  );
  const uppy = new Uppy();
  uppy.use(Dashboard, {
    target: "#files-drag-drop",
    showProgressDetails: true,
    closeModalOnClickOutside: true,
  });
  uppy.use(Tus, {
    endpoint: "http://localhost:8786/tus",
    withCredentials: true,
    headers: {
      "sonic-mode": id ? "update" : "create",
      "sonic-route": route,
      "data-id": id,
    },
  });
  return uppy;
};

const handleCustomEventForUppy = (uppy, event) => {
  if (uppy) {
    const field = event.component.key.replaceAll("_btn", "");
    currUppyField = field;
    const tus = uppy.getPlugin("Tus");
    tus.opts.headers["sonic-field"] = field;
    const dashboard = uppy.getPlugin("Dashboard");
    if (!dashboard.isModalOpen()) {
      dashboard.openModal();
    }
  }
};

const addFileButtons = (data) => {
  return data.reduce((acc, c) => {
    if (c.metaType == "file") {
      acc.push({
        ...c,
        disabled: true,
      });
      acc.push({
        ...c,
        key: c.key + "_btn",
        label: "Choose File",
        type: "button",
        action: "event",
        theme: "secondary",
      });
    } else {
      acc.push(c);
    }
    return acc;
  }, []);
};

const getImageElement = (url) => {
  const urlParts = url.split("/");
  let field = "";
  urlParts.forEach((part) => {
    if (part.includes("f_")) {
      field = part.replace("f_", "");
    }
  });
  document.querySelector(`.file-preview-${field}`)?.remove();
  return `<div class="file-preview file-preview-${field}" style="height: 140px; max-width: max-content">
          <img style="width: 100%; height: 100%; object-fit: contain" src="${url}" />
          </div>`;
};
const onUploadSuccess = (form) => (file, response) => {
  console.log(file, response);
  if (file && response) {
    const type = file.type;
    const component = form.getComponent(currUppyField);
    if (type.includes("image")) {
      const element = component.element;
      if (element) {
        element.insertAdjacentHTML(
          "afterend",
          getImageElement(response?.uploadURL)
        );
      }
    }
    console.log("component", component);
    if (component && response?.uploadURL) {
      const url = new URL(response?.uploadURL).pathname;
      component.setValue(url);
    }
  }
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

    response.data = addFileButtons(response.data);
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
            uppy.on("upload-success", onUploadSuccess(form));
          })
          .catch((e) => {
            console.log(e);
          });
      }
      form.on("submit", function (data) {
        Object.keys(data.data).forEach((key) => {
          if (key.endsWith("_btn")) {
            delete data.data[key];
          }
        });
        console.log(JSON.stringify(data, null, 2));
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
        handleCustomEventForUppy(uppy, event);
      });
    });
  });
}

function saveNewContent(data) {
  delete data.data.submit;
  delete data.data.id;

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
  const routeWithoutAuth = route.replaceAll("/auth/", "/");

  axios
    .get(`/v1/${routeWithoutAuth}/${contentId}?includeContentType`)
    .then((response) => {
      const fileFields = response.data.contentType.filter(
        (c) => c.metaType == "file"
      );
      response.data.contentType = addFileButtons(response.data.contentType);
      let uppy;
      Formio.icons = "fontawesome";
      // debugger;
      // Formio.createForm(document.getElementById("formio"), {
      Formio.createForm(document.getElementById("formio"), {
        components: response.data.contentType,
      }).then(function (form) {
        if (fileFields.length) {
          const formio = document.getElementById("formio");
          const childDiv = document.createElement("div");
          childDiv.id = "files-drag-drop";
          formio.parentNode.insertBefore(childDiv, formio);
          initUppy(response?.data?.data?.id)
            .then((u) => {
              uppy = u;
              uppy.on("upload-success", onUploadSuccess(form));
            })
            .catch((e) => {
              console.log(e);
            });

          for (const field of fileFields) {
            const value = response?.data?.data?.[field.key];
            const component = form.getComponent(field.key);
            const element = component?.element;
            if (value && element) {
              let extensions = [
                "jpg",
                "jpeg",
                "png",
                "bmp",
                "gif",
                "svg",
                "webp",
                "avif",
              ];
              let regex = new RegExp(`\\.(${extensions.join("|")})$`, "i");
              if (regex.test(value)) {
                element.insertAdjacentHTML("afterend", getImageElement(value));
              }
            }
          }
        }
        form.on("submit", function ({ data }) {
          Object.keys(data).forEach((key) => {
            if (key.endsWith("_btn")) {
              delete data[key];
            }
          });
          console.log(JSON.stringify(data, null, 2));
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

        form.on("customEvent", function (event) {
          handleCustomEventForUppy(uppy, event);
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
