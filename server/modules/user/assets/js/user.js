/* user module for loggedin users */
var sessionID;
var axiosInstance;

$(document).ready(async function () {
  setupSessionID();
  await setupAxiosInstance();
});

async function setupAxiosInstance() {
  let baseUrl = window.location.protocol + "//" + window.location.host + "/";
  let token = $("#token").val();

  const defaultOptions = {
    headers: {
      Authorization: `${token}`,
    },
    baseUrl: baseUrl,
  };

  axiosInstance = axios.create(defaultOptions);
}

function setupSessionID() {
  sessionID = $("#sessionID").val();
}

//TODO, make this just refresh the body content with a full get
function fullPageUpdate(url = undefined) {
  // debugger;
  console.log("refreshing page");
  if (url) {
    window.location.replace(url);
  } else {
    location.reload();
  }
}

async function openFormInModal(action, contentType, id) {
  await openEditForm(action, id);
  await openDeleteForm(action, id);
  await openCreateForm(action, contentType);
}

async function openEditForm(action, id) {
  if (action === "edit") {
    let content = await dataService.getContentById(id);
    let form = await formService.getForm(
      content.contentTypeId,
      content,
      "await submitContent(submission);",
      undefined,
      undefined,
      undefined
    );

    $("#genericModal .modal-title").text(
      helperService.titleCase(`${action} ${content.contentTypeId}`)
    );

    $("#formio").empty();
    $("#formio").html(form);

    loadModuleSettingForm();

    $('input[name="data[title]"').focus();

    $("#genericModal").appendTo("body").modal("show");
  }
}

async function openDeleteForm(action, id) {
  if (action === "delete") {
    let content = await dataService.getContentById(id);
    let form = JSON.stringify(
      content.data,
      null,
      4
    );

    form += `<button class="mt-2" type="button"  onclick="return confirmDelete('${content.id}', 1)""><i class="bi bi-trash"></i> Confirm Delete</button>`;

    $("#genericModal .modal-title").text(
      helperService.titleCase(`${action} ${content.contentTypeId}`)
    );

    $("#formio").empty();
    $("#formio").html(form);


    $("#genericModal").appendTo("body").modal("show");
  }
}

async function confirmDelete(id){
  console.log('attempting delete of ', id);

  dataService.contentDelete(id, $('#sessionID').val()).then((response)=>{
    fullPageUpdate();

  })


}

async function openCreateForm(action, contentType) {
  if (action === "create") {
    // let content = await dataService.getContentById(id);
    let form = await formService.getForm(
      contentType,
      undefined,
      "await submitContent(submission);",
      undefined,
      undefined,
      undefined
    );

    $("#genericModal .modal-title").text(
      helperService.titleCase(`${action} ${contentType}`)
    );

    $("#formio").empty();
    $("#formio").html(form);

    loadModuleSettingForm();

    $('input[name="data[title]"').focus();

    $("#genericModal").appendTo("body").modal("show");
  }
}

async function submitContent(
  submission,
  refresh = true,
  contentType = "content"
) {
  console.log("Submission was made!", submission);
  let entity = submission.data ? submission.data : submission;

  if (!contentType.startsWith("user")) {
    if (submission.id || submission.data.id) {
      await editInstance(entity, refresh, contentType);
    } else {
      debugger;
      await createInstance(entity, true, contentType);
    }
  } else {
    entity.contentType = contentType;

    let result = await axios({
      method: "post",
      url: "/form-submission",
      data: {
        data: entity,
      },
    });
    fullPageUpdate();
  }
}

async function editInstance(payload, refresh, contentType = "content") {
  if (contentType === "user") {
    contentType = "users";
  }
  dataService
    .editInstance(payload, sessionID)
    .then(async function (response) {
      // debugger;
      console.log("editInstance -->", response);
      // resolve(response.data);
      // return await response.data;
      if (response.contentTypeId === "page" && !globalService.isBackEnd()) {
        if (response.url) {
          window.location.href = response.url;
        } else {
          fullPageUpdate();
        }
      } else if (refresh) {
        fullPageUpdate();
      }
    })
    .catch(function (error) {
      console.log("editInstance", error);
    });
}

async function createInstance(
  payload,
  refresh = false,
  contentType = "content"
) {
  // console.log('createInstance payload', payload);
  // let content = {};
  // content.data = payload;
  // this.processContentFields(payload, content);
  // debugger;
  console.log("payload", payload);
  if (payload.id || "id" in payload) {
    delete payload.id;
  }

  if (!payload.data) {
    let temp = { data: payload };
    payload = temp;
  }

  if (contentType === "Roles") {
    payload = payload.data;
  }

  // debugger;
  let entity = await dataService.contentCreate(payload);

  if (entity && entity.contentTypeId === "page") {
    let isBackEnd = globalService.isBackEnd();
    if (isBackEnd) {
      window.location.href = `/admin/content/edit/page/${entity.id}`;
    } else {
      window.location.href = payload.data.url;
    }
  } else if (refresh) {
    fullPageUpdate();
  }

  return entity;
}
