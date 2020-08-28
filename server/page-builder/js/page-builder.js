var page = {};
var contentType;
var contentTypeComponents;
var axiosInstance;

var imageList,
  tinyImageList,
  currentSectionId,
  currentSection,
  currentRow,
  currentRowIndex,
  currentColumn,
  currentColumnIndex,
  currentModuleId,
  currentModuleIndex,
  currentModuleContentType,
  jsonEditor,
  ShortcodeTree,
  jsonEditorRaw;

$(document).ready(async function () {
  await setupAxiosInstance();
  setupUIHovers();
  setupUIClicks();
  setupClickEvents();
  // setupWYSIWYG();
  setupJsonEditor();
  await setPage();
  await setContentType();
  setupJsonEditorContentTypeRaw();
  setupJsonRawSave();
  imageList = await getImageList();
  // setTimeout(setupPageSettings, 1);
  // setupPageSettings();

  setupFormBuilder(contentType);
  await setupACEEditor();
  await setupDropZone();
  setupSortable();
  setupSidePanel();
  setupAdminMenuMinimizer();
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

async function setPage() {
  let pageId = $("#page-id").val();
  if (pageId) {
    // console.log("pageId", pageId);
    axiosInstance.get(`/api/contents/${pageId}`).then(function (response) {
      // handle success
      this.page = response.data;
      // console.log("getPage page", page);
    });
  }
}

async function setContentType() {
  let contentTypeId = $("#contentTypeId").val();
  if (contentTypeId) {
    this.contentType = await getContentType(contentTypeId);
  }
}

function axiosTest() {
  // console.log("running axios");
  axiosInstance
    .get("/api/contents")
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
      // console.log("done axios");
    });
}

function setupUIHovers() {
  $(".pb-section").on({
    mouseenter: function () {
      let sectionId = getParentSectionId($(this));
      $(`section[id='${sectionId}']`).addClass("section-highlight");
    },
    mouseleave: function () {
      let sectionId = getParentSectionId($(this));
      $(`section[id='${sectionId}']`).removeClass("section-highlight");
    },
  });

  $(".mini-layout .pb-row").on({
    mouseenter: function () {
      let sectionId = getParentSectionId($(this));
      let rowIndex = $(this).index();
      getRow(sectionId, rowIndex).addClass("row-highlight");
    },
    mouseleave: function () {
      let sectionId = getParentSectionId($(this));
      let rowIndex = $(this).index();
      getRow(sectionId, rowIndex).removeClass("row-highlight");
    },
  });

  $(".mini-layout .pb-row .col").on({
    mouseenter: function () {
      let sectionId = getParentSectionId($(this));
      let parentRow = getParentRow(this);
      let rowIndex = $(this).parent().index();
      let colIndex = $(this).index() + 1;
      getColumn(sectionId, rowIndex, colIndex).addClass("col-highlight");
    },
    mouseleave: function () {
      let sectionId = getParentSectionId($(this));
      let parentRow = getParentRow(this);
      let rowIndex = $(this).parent().index();
      let colIndex = $(this).index() + 1;
      getColumn(sectionId, rowIndex, colIndex).removeClass("col-highlight");
    },
  });
}

function disableUIHoversAndClicks() {
  $(".pb-section").off();
  $(".mini-layout .pb-row").off();
  $(".mini-layout .pb-row .col").off();
  $("section .row > *").off();
  $("section .row .module").off();
  removeAllHighlights();
  $(".edit-module").hide();
  $(".section-editor-button").hide();
}

function removeAllHighlights() {
  $(".row-highlight").removeClass("row-highlight");
  $(".col-highlight").removeClass("col-highlight");
  $(".block-edit").removeClass("block-edit");
  $("html").removeClass("pb");
}

function setupUIClicks() {
  $("html").addClass("pb");

  $(".mini-layout .pb-row").on({
    click: function () {
      currentSectionId = getParentSectionId($(this));
      currentRowIndex = $(this).index();
      console.log("currentRowIndex pbrow", currentRowIndex);
      currentRow = getRow(currentSectionId, currentRowIndex).addClass(
        "row-highlight"
      );
      $(".row-button").show().appendTo(currentRow);
    },
  });

  $(".mini-layout .pb-row .col").on({
    click: function () {
      currentSectionId = getParentSectionId($(this));
      currentRow = getParentRow(this);
      currentRowIndex = $(this).parent().index();
      console.log("currentRowIndex pbcol", currentRowIndex);
      currentColumnIndex = $(this).index() + 1;
      currentColumn = getColumn(
        currentSectionId,
        currentRowIndex,
        currentColumnIndex
      ).addClass("col-highlight");
      $(".col-button").show().appendTo(currentColumn);
    },
  });

  $("section .row > *").on({
    click: function () {
      // debugger;
      $(".col-highlight").removeClass("col-highlight");
      $(".block-edit").removeClass("block-edit");
      currentSectionId = $(this).closest("section").data("id");
      currentRow = $(this).closest(".row")[0];
      $(this).closest(".row").addClass("row-highlight");
      currentRowIndex = $(this).closest(".row").index();
      console.log("currentRowIndex pbcol", currentRowIndex);
      currentColumnIndex = $(this).index() + 1;
      currentColumn = $(this);
      currentColumn.addClass("col-highlight");
      $(".col-button").show().appendTo(currentColumn);
      $(".add-module").show().appendTo(currentColumn);
      $(".row-button").show().appendTo(currentRow);
      // $('.block-button').show().appendTo(currentColumn.children('.module'));
      // currentColumn.children('.module').addClass('block-edit');
    },
  });

  $("section .row .module").on({
    click: function () {
      // debugger;
      let moduleDiv = $(this).closest(".module");
      currentModuleId = moduleDiv.data("id");
      currentModuleIndex = $(moduleDiv).index();
      currentModuleContentType = moduleDiv.data("content-type");
      currentSection = $(this)[0].closest("section");
      currentSectionId = currentSection.dataset.id;
      currentRow = $(this)[0].closest(".row");
      currentRowIndex = $(currentRow).index();
      currentColumn = $(this)[0].closest('div[class^="col"]');
      currentColumnIndex = $(currentColumn).index();

      console.log("moduleId", currentModuleId);
      $(".edit-module").show().appendTo(moduleDiv);
      // currentColumn.children('.module').addClass('block-edit');
    },
  });
}

function getParentSectionId(el) {
  return $(el).closest(".pb-section").data("id");
}

function getRow(sectionId, rowIndex) {
  return $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`);
}

function getParentRow(el) {
  return $(el).closest(".row");
}

function getColumn(sectionId, rowIndex, colIndex) {
  return getRow(sectionId, rowIndex).find(`.col:nth-child(${colIndex})`);
}

async function setupClickEvents() {
  //add section
  // $('.add-section').on("click", async function () {
  //     await addSection();
  // });
  setupSectionBackgroundEvents();
}

async function getCurrentSection() {
  currentSectionRecord = await getContentInstance(currentSectionId);
  return currentSectionRecord;
}

async function setupSectionBackgroundEvents() {
  $(".section-background-editor button").on("click", async function () {
    let backgroundSetting = $(this).data("type");
    currentSectionId = $(this).data("section-id");
    setupColorPicker(currentSectionId);

    currentSectionRecord = await getCurrentSection();
    currentSectionRecord.data.background = { type: backgroundSetting };
    // setDefaultBackgroundSetting(currentSectionRecord);
    showBackgroundTypeOptions(backgroundSetting, currentSectionId);

    editContentInstance(currentSectionRecord);
  });
}

async function setDefaultBackgroundSetting(currentSectionRecord, color) {
  currentSectionRecord.data.background.color = color;
}

async function showBackgroundTypeOptions(backgroundSetting, sectionId) {
  $("[id^=background-]").hide();
  let selector = `[id='background-${backgroundSetting}'],[data-id='${sectionId}']`;
  $(selector).show();
}

async function setupColorPicker(currentSectionId) {
  const pickr = Pickr.create({
    el: `#backgroundColorPreview-${currentSectionId}`,
    theme: "nano", // or 'monolith', or 'nano'

    swatches: [
      "rgba(244, 67, 54, 1)",
      "rgba(233, 30, 99, 0.95)",
      "rgba(156, 39, 176, 0.9)",
      "rgba(103, 58, 183, 0.85)",
      "rgba(63, 81, 181, 0.8)",
      "rgba(33, 150, 243, 0.75)",
      "rgba(3, 169, 244, 0.7)",
      "rgba(0, 188, 212, 0.7)",
      "rgba(0, 150, 136, 0.75)",
      "rgba(76, 175, 80, 0.8)",
      "rgba(139, 195, 74, 0.85)",
      "rgba(205, 220, 57, 0.9)",
      "rgba(255, 235, 59, 0.95)",
      "rgba(255, 193, 7, 1)",
    ],

    components: {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: false,
        rgba: false,
        hsla: false,
        hsva: false,
        cmyk: false,
        input: true,
        clear: true,
        save: true,
      },
    },
  });

  pickr
    .on("change", (color, instance) => {
      // debugger;
      console.log("change", color, instance);
      $(`section[data-id="${currentSectionId}"]`).css(
        "background-color",
        color.toHEXA()
      );
    })
    .on("save", (color, instance) => {
      console.log("save", color, instance);
    });

  var parent = document.querySelector(
    `#backgroundColorPreview-${currentSectionId}`
  );
  // var parent = $('#background-color-preview');

  // var parent = $('.color-picker input');

  // debugger;
  // var picker = new Picker({ parent: parent, popup: 'bottom' });

  // picker.onChange = function (color) {
  //     parent.style.background = color.rgbaString;
  //     $(`section[data-id="${currentSectionId}"]`).css('background-color', getHtmlHex(color.hex));
  // };

  // picker.onDone = async function (color) {
  //     currentSectionRecord = await getCurrentSection();
  //     setDefaultBackgroundSetting(currentSectionRecord, getHtmlHex(color.hex));
  //     editContentInstance(currentSectionRecord);
  // };
}

function getHtmlHex(hex) {
  return hex;
  // return hex.substring(0,7);
}

async function addSection() {
  console.log("adding section");
  let row = await generateNewRow();
  //rows
  let rows = [row];

  //section
  let nextSectionCount = 1;
  if (page.data.layout) {
    nextSectionCount = page.data.layout.length + 1;
  }

  let section = {
    title: `Section ${nextSectionCount}`,
    contentType: "section",
    rows: rows,
  };
  let s1 = await createContentInstance(section);

  //add to current page
  if (!page.data.layout) {
    page.data.layout = [];
  }
  page.data.layout.push(s1.id);

  // this.contentService.editPage(this.page);
  let updatedPage = await editContentInstance(page);

  //update ui
  // this.fullPageUpdate();
  // this.loadSections(updatedPage);
  fullPageUpdate();
}

async function editSection(sectionId) {
  console.log(sectionId);
  currentSectionRecord = await getContentInstance(sectionId);
  currentSection = currentSectionRecord.data;
  console.log("currentSection", currentSection);
  // $('#section-editor').text(JSON.stringify(currentSection));
  loadJsonEditor();
  $("#sectoinEditorModal").appendTo("body").modal("show");
}

async function deleteSection(sectionId, index) {
  console.log("delete section", sectionId, index);
  //delete from page
  page.data.layout.splice(index, 1);
  await editContentInstance(page);

  //delete section
  await deleteContentInstance(sectionId);
  fullPageUpdate();
}

async function saveSection() {
  var sectionData = jsonEditor.get();
  console.log("jsonEditor", sectionData);
  await editContentInstance(sectionData);
  fullPageUpdate();

  // console.log(sectionId);
  // currentSectionRecord = await getContentInstance(sectionId);
  // currentSection = currentSectionRecord.data;
  // console.log('currentSection', currentSection);
  // $('#section-editor').text(JSON.stringify(currentSection));
  // $('#sectoinEditorModal').appendTo("body").modal('show');
}

async function generateNewRow() {
  let col = await generateNewColumn();

  let row = { class: "row", columns: [col] };

  return row;
}

async function generateNewColumn() {
  // let block1 = { contentType: 'block', body: '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>' };

  // //save blocks and get the ids
  // let b1 = await createContentInstance(block1);
  // let b1ShortCode = `[BLOCK id="${b1.id}"/]`;

  //columns
  // let col = { class: 'col', content: `${b1ShortCode}` }
  let col = { class: "col", content: `` };
  return col;
}

// async function addRow(sectionId) {
//     console.log('adding row to section: ' + sectionId);
//     let row = await this.generateNewRow();

//     let section = await getContentInstance(sectionId);
//     section.data.rows.push(row);
//     editContentInstance(section);

//     fullPageUpdate();
// }

async function addRow() {
  let row = await this.generateNewRow();

  let section = await getContentInstance(currentSectionId);
  section.data.rows.push(row);
  editContentInstance(section);

  fullPageUpdate();
}

// async function addColumn(sectionId, rowIndex) {
//     console.log('adding column ', sectionId, rowIndex);
//     let section = await getContentInstance(sectionId);
//     console.log('secton', section);
//     let column = await generateNewColumn();
//     section.data.rows[rowIndex].columns.push(column);
//     console.log('columns', section.data.rows[rowIndex].columns);
//     editContentInstance(section);

//     fullPageUpdate();
// }

async function addColumn() {
  // debugger;
  let section = await getContentInstance(currentSectionId);
  console.log("secton", section);
  console.log("currentRowIndex", currentRowIndex);

  let column = await generateNewColumn();
  section.data.rows[currentRowIndex].columns.push(column);
  // console.log("columns", section.data.rows[currentRowIndex].columns);
  editContentInstance(section);

  fullPageUpdate();
}

async function deleteColumn() {
  let section = await getContentInstance(currentSectionId);
  section.data.rows[currentRowIndex].columns.splice(currentColumnIndex - 1, 1);

  //TODO, delete block too

  editContentInstance(section);

  fullPageUpdate();
}

async function deleteRow() {
  let section = await getContentInstance(currentSectionId);
  debugger;
  section.data.rows.splice(currentRowIndex, 1);
  editContentInstance(section);
  fullPageUpdate();
}

async function editColumnContent() {
  console.log(currentSectionId);
  editSection(currentSectionId);
}

async function deleteBlock() {
  let section = await getContentInstance(currentSectionId);
  section.data.rows[currentRowIndex].columns.splice(currentColumnIndex - 1, 1);

  //TODO, delete block too

  editContentInstance(section);

  fullPageUpdate();
}

async function getContentInstance(id) {
  return axiosInstance
    .get(`/api/contents/${id}`)
    .then(async function (response) {
      // console.log(response);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function getContentType(systemId) {
  const filter = `{"where":{"systemid":"${systemId}"}}`;
  const encodedFilter = encodeURI(filter);
  let url = `/api/contentTypes?filter=${encodedFilter}`;
  return axiosInstance
    .get(url)
    .then(async function (record) {
      if (record.data[0]) {
        return record.data[0];
      }
      return "not found";
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function getContentByContentTypeAndTitle(contentType, title) {
  const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
  const encodedFilter = encodeURI(filter);
  let url = `/api/contents?filter=${encodedFilter}`;
  return axiosInstance
    .get(url)
    .then(async function (record) {
      if (record.data[0]) {
        return record.data[0];
      }
      return "not found";
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function createContentInstance(payload) {
  // console.log('createContentInstance payload', payload);
  // let content = {};
  // content.data = payload;
  // this.processContentFields(payload, content);
  console.log("payload", payload);
  if (payload.id || "id" in payload) {
    delete payload.id;
  }

  if (!payload.data) {
    let temp = { data: payload };
    payload = temp;
  }

  // return this.http.post("/api/contents/", content).toPromise();
  return axiosInstance
    .post("/api/contents/", payload)
    .then(async function (response) {
      console.log(response);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function editContentInstance(payload, refresh) {
  // debugger;
  let id = payload.id;
  console.log("putting payload", payload);
  if (payload.id) {
    delete payload.id;
  }
  if (payload.data && payload.data.id) {
    id = payload.data.id;
    delete payload.data.id;
  }
  // let data = {};
  // if(payload.data){
  //     data = payload.data;
  // }else{
  //     data = payload;
  // }
  // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();

  console.log(payload);
  return axiosInstance
    .put(`/api/contents/${id}`, payload)
    .then(async function (response) {
      // debugger;
      console.log("editContentInstance", response);
      // resolve(response.data);
      // return await response.data;
      if (refresh) {
        fullPageUpdate();
      }
    })
    .catch(function (error) {
      debugger;
      console.log("editContentInstance", error);
    });
}

async function editContentType(payload) {
  // debugger;
  let id = payload.id;
  if (!id) {
    return;
  }

  console.log("putting payload", payload);
  if (payload.id) {
    delete payload.id;
  }

  // let data = {};
  // if(payload.data){
  //     data = payload.data;
  // }else{
  //     data = payload;
  // }
  // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
  // debugger;
  return axiosInstance
    .put(`/api/contentTypes/${id}`, payload)
    .then(async function (response) {
      console.log(response);
      // debugger;
      //reload editor
      let contentType = await response.data;
      contentType.id = id;
      setupFormBuilder(contentType);
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function deleteContentInstance(id) {
  console.log("deleting content", id);
  // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
  return axiosInstance
    .delete(`/api/contents/${id}`)
    .then(async function (response) {
      console.log(response);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function deleteContentType(id) {
  console.log("deleting content", id);
  // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
  axiosInstance
    .delete(`/api/contentTypes/${id}`)
    .then(async function (response) {
      console.log(response);
      redirect("/admin/content-types");
    })
    .catch(function (error) {
      console.log(error);
    });
}

// function processContentFields(payload, content) {
//     for (var property in payload) {
//         if (payload.hasOwnProperty(property)) {
//             if (property == 'url' || property == 'id') {
//                 content.url = payload.url;
//                 continue;
//             }
//             content.data[property] = payload[property];
//         }
//     }
// }

function processContentFields(payload) {
  return { id: payload.id, data: payload };
}

async function openForm(action, contentType) {
  await setupPageSettings(action, contentType);
  $("#pageSettingsModal").appendTo("body").modal("show");
}

async function setupPageSettings(action, contentType) {
  console.log("setupPageSettings");
  let pageId = $("#page-id").val();
  // let page = await getContentInstance(pageId);

  // Formio.createForm(document.getElementById('formio'), {
  let components = [
    {
      type: "textfield",
      key: "firstName",
      label: "First Name",
      placeholder: "Enter your first name.",
      input: true,
    },
    {
      type: "textfield",
      key: "lastName",
      label: "Last Name",
      placeholder: "Enter your last name",
      input: true,
    },
    {
      type: "button",
      action: "submit",
      label: "Submit",
      theme: "primary",
    },
  ];

  // debugger;
  if (!this.page.data) {
    // debugger;
    console.log("no data");
    alert("no data");

    while (!this.page.data) {
      //wait till there is data
      console.log("now data is ready");
    }
  }

  console.log("this.page.data==>", this.page.data);

  let formValuesToLoad = {};
  let componentsToLoad = components;
  // debugger;
  if (action == "edit" && contentType == "current") {
    formValuesToLoad = this.page.data;
  }

  if (action == "add") {
    // components.find(({ key }) => key === 'id' ).remove();
    componentsToLoad = components.filter((e) => e.key !== "id");
  }

  let formio = Formio.createForm(document.getElementById("formio"), {
    components: componentsToLoad,
  }).then(async function (form) {
    form.submission = {
      data: formValuesToLoad,
    };
    form.on("submit", async function (submission) {
      console.log("submission ->", submission);
      //TODO: copy logic from admin app to save data
      // let entity = {id: submission.data.id, url: submission.data.url, data: submission.data}
      if (action == "add") {
        // debugger;
        //need create default block, etc
        submission.data.contentType = contentType;
        await createContentInstance(submission.data);
        await postProcessNewContent(submission.data);
        await redirect(submission.data.url);
      } else {
        //editing current
        // debugger;
        let entity = processContentFields(submission.data);
        await editContentInstance(entity);
        fullPageUpdate();
      }

      // debugger;

      // for(var name in submission.data) {
      //     var value = submission.data[name];
      //     page.data[name] = value;
      // }
    });
    form.on("error", (errors) => {
      console.log("We have errors!");
    });
  });

  console.log("page settings loaded");
}

async function setupFormBuilder(contentType) {
  // debugger;
  // (change)="onFormioChange($event)"
  let formDiv = $("#formBuilder");
  if (!formDiv.length) {
    return;
  }
  formDiv.empty();

  Formio.icons = "fontawesome";
  formService.setFormApiUrls(Formio);

  Formio.builder(document.getElementById("formBuilder"), null).then(
    async function (form) {
      form.setForm({
        components: contentType.data.components,
      });
      form.on("submit", async function (submission) {
        //             debugger;
        console.log("submission ->", submission);
      });
      form.on("change", async function (event) {
        // debugger;
        if (event.components) {
          contentTypeComponents = event.components;
          console.log("event ->", event);
        }
      });
    }
  );

  // Formio.builder(document.getElementById('formBuilder'), componentsToLoad)
  //     .then(async function (form) {
  //         form.on('submit', async function (submission) {
  //             debugger;
  //             console.log('submission ->', submission);
  //             //TODO: copy logic from admin app to save data
  //             // let entity = {id: submission.data.id, url: submission.data.url, data: submission.data}
  //             if (action == 'add') {
  //                 // debugger;
  //                 //need create default block, etc
  //                 // submission.data.contentType = contentType;
  //                 // await createContentInstance(submission.data);
  //                 // await postProcessNewContent(submission.data);
  //                 // await redirect(submission.data.url);
  //             }
  //             else {
  //                 //editing current
  //                 // debugger;
  //                 // let entity = processContentFields(submission.data)
  //                 // await editContentInstance(entity);
  //                 // fullPageUpdate();
  //             }

  //             // debugger;

  //             // for(var name in submission.data) {
  //             //     var value = submission.data[name];
  //             //     page.data[name] = value;
  //             // }
  //         });;

  // let formio = Formio.createForm(document.getElementById('formBuilder'), {
  //     components: componentsToLoad
  // }).then(async function (form) {
  //     form.submission = {
  //         // data: formValuesToLoad
  //     };
  //     form.on('submit', async function (submission) {
  //         console.log('submission ->', submission);
  //         //TODO: copy logic from admin app to save data
  //         // let entity = {id: submission.data.id, url: submission.data.url, data: submission.data}
  //         if (action == 'add') {
  //             // debugger;
  //             //need create default block, etc
  //             submission.data.contentType = contentType;
  //             await createContentInstance(submission.data);
  //             await postProcessNewContent(submission.data);
  //             await redirect(submission.data.url);
  //         }
  //         else {
  //             //editing current
  //             // debugger;
  //             let entity = processContentFields(submission.data)
  //             await editContentInstance(entity);
  //             fullPageUpdate();
  //         }

  //         // debugger;

  //         // for(var name in submission.data) {
  //         //     var value = submission.data[name];
  //         //     page.data[name] = value;
  //         // }
  //     });
  //     form.on('error', (errors) => {
  //         console.log('We have errors!');
  //     })
  // });
}

async function onContentTypeSave() {
  if (contentTypeComponents) {
    console.log("contentTypeComponents", contentTypeComponents);
    contentType.data.components = contentTypeComponents;
    if (!contentType.id) {
      contentType.id = $("#createContentTypeForm #id").val();
    }
    await editContentType(contentType);
  }
}

async function onContentTypeRawSave() {
  var contentType = jsonEditorRaw.get();
  console.log("jsonEditor", contentType);
  await editContentType(contentType);
  fullPageUpdate();

  // if (contentTypeComponents) {
  //   console.log("contentTypeComponents", contentTypeComponents);
  //   contentType.data.components = contentTypeComponents;
  //   if (!contentType.id) {
  //     contentType.id = $("#createContentTypeForm #id").val();
  //   }
  //   await editContentType(contentType);
  // }
}

async function openNewContentTypeModal() {
  $("#newContentTypeModal").appendTo("body").modal("show");
}

async function openWYSIWYG() {
  console.log("WYSIWYG setup");
  // $('section span').on("click", async function () {
  var id = $(".block-edit").data("id");
  console.log("span clicked " + id);
  $("#block-edit-it").val(id);
  $("#wysiwygModal").appendTo("body").modal("show");

  var content = await getContentInstance(id);

  $("textarea.wysiwyg-content").html(content.data.body);

  // $(document).off('focusin.modal');
  //allow user to interact with tinymcs dialogs: https://stackoverflow.com/questions/36279941/using-tinymce-in-a-modal-dialog
  $(document).on("focusin", function (e) {
    if ($(e.target).closest(".tox-dialog").length) {
      e.stopImmediatePropagation();
    }
  });

  tinymce.remove(); //remove previous editor
  // tinymce.baseURL = '/tinymce/';
  // console.log('tinymce.base_url',tinymce.baseURL);
  //plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount tinymcespellchecker a11ychecker imagetools textpattern help formatpainter permanentpen pageembed tinycomments mentions linkchecker',

  $("textarea.wysiwyg-content").tinymce({
    selector: "#block-content",
    height: 600,
    plugins: "image imagetools code",
    toolbar:
      "code | formatselect | bold italic strikethrough forecolor backcolor permanentpen formatpainter | link image media pageembed | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | addcomment",
    image_advtab: false,
    image_list: tinyImageList,
    automatic_uploads: true,
    images_upload_handler: function (blobInfo, success, failure) {
      var xhr, formData;

      xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open("POST", "/api/containers/container1/upload");

      xhr.onload = function () {
        var json;

        if (xhr.status != 200) {
          failure("HTTP Error: " + xhr.status);
          return;
        }

        json = JSON.parse(xhr.responseText);
        var file = json.result.files.file[0];
        var location = `/api/containers/${file.container}/download/${file.name}`;
        if (!location) {
          failure("Invalid JSON: " + xhr.responseText);
          return;
        }

        success(location);
      };

      formData = new FormData();
      formData.append("file", blobInfo.blob(), blobInfo.filename());

      xhr.send(formData);
    },
  });
  // });
}

function setupJsonEditor() {
  var container = document.getElementById("jsoneditor");
  if (!container) return;

  var options = {
    mode: "text",
    modes: ["code", "form", "text", "tree", "view"], // allowed modes
    onError: function (err) {
      alert(err.toString());
    },
    onModeChange: function (newMode, oldMode) {
      console.log("Mode switched from", oldMode, "to", newMode);
    },
  };

  jsonEditor = new JSONEditor(container, options);
  // editor.destroy(); //reset'
}

function setupJsonEditorContentTypeRaw() {
  var containerRaw = document.getElementById("jsoneditorRaw");
  if (!containerRaw) return;

  var options = {
    mode: "text",
    modes: ["code", "form", "text", "tree", "view"], // allowed modes
    onError: function (err) {
      alert(err.toString());
    },
    onModeChange: function (newMode, oldMode) {
      console.log("Mode switched from", oldMode, "to", newMode);
    },
  };

  jsonEditorRaw = new JSONEditor(containerRaw, options);

  // set json
  if (this.contentType) {
    initialJson = this.contentType;
  } else if (formValuesToLoad) {
    initialJson = formValuesToLoad;
  }

  jsonEditorRaw.set(initialJson);

  // get json
  const updatedJson = jsonEditorRaw.get();
}

function loadJsonEditor() {
  var json = currentSectionRecord;
  jsonEditor.set(json);

  // get json
  var editor = jsonEditor.get();
}

function setupJsonRawSave() {
  $("#saveRawJson").on("click", function () {
    console.log("json save");
    let contentId = $("#contentId").val();

    var json = { data: jsonEditorRaw.get() };
    json.data.id = contentId;

    // debugger;

    submitContent(json);
  });
}

async function getImageList() {
  let imageList = await axiosInstance.get(`/api/containers/container1/files`);
  // console.log('imageList', imageList.data);

  tinyImageList = [];

  imageList.data.forEach((image) => {
    let imageItem = {
      title: image.name,
      value: `/api/containers/${image.container}/download/${image.name}`,
    };
    tinyImageList.push(imageItem);
  });
}

async function saveWYSIWYG() {
  let id = $(".block-edit").data("id");
  console.log("saving " + id);

  let content = $("textarea.wysiwyg-content").html();

  //update db
  let block = await getContentInstance(id);
  block.data.body = content;
  editContentInstance(block);

  //update screen
  $(".block-edit").children().first().html(content);
  // $(`span[data-id="${id}"]`).html(content);

  //re-add block edit
  $(".block-button").show().appendTo($(".block-edit"));

  fullPageUpdate();
}

async function addModule(systemid) {
  showSidePanel();

  let form = await formService.getForm(
    systemid,
    undefined,
    "addModuleToColumn(submission, true)"
  );

  $(".pb-side-panel #main").html(form);

  loadModuleSettingForm();
  // $("#moduleSettingsModal")
  //   .appendTo("body")
  //   .modal("show");
}

async function editModule() {
  // cleanModal();
  showSidePanel();

  console.log("editing module: " + currentModuleId, currentModuleContentType);

  let data = await getContentInstance(currentModuleId);

  let form = await formService.getForm(
    currentModuleContentType,
    data,
    "await editContentInstance(submission, true);"
  );
  $("#dynamicModelTitle").text(
    `Settings: ${currentModuleContentType} (Id:${currentModuleId})`
  );

  // $("#moduleSettingsFormio").html(form);
  $(".pb-side-panel #main").html(form);
  loadModuleSettingForm();
  // $("#moduleSettingsModal")
  //   .appendTo("body")
  //   .modal("show");
}

async function copyModule() {
  console.log("copying module: " + currentModuleId, currentModuleContentType);
  //need index and column

  let moduleDiv = $(`.module[data-id='${currentModuleId}'`);

  // debugger;
  let source = await getModuleHierarchy(moduleDiv);

  let payload = { data: {} };
  payload.data.sectionId = currentSectionId;
  payload.data.rowIndex = currentRowIndex;
  payload.data.columnIndex = currentColumnIndex - 1;
  payload.data.moduleId = currentModuleId;
  payload.data.moduleIndex = currentModuleIndex;

  // payload.data.destinationSectionId = destinationSectionId;
  // payload.data.destinationRowIndex = destinationRowIndex;
  // payload.data.destinationColumnIndex = destinationColumnIndex;
  // payload.data.destinationModuleIndex = event.newIndex;
  // payload.data.destinationModules = destinationModules;

  return axiosInstance
    .post("/admin/pb-update-module-copy", payload)
    .then(async function (response) {
      // debugger;
      console.log(response);
      fullPageUpdate();
      // return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function deleteModule() {
  console.log("deleting module: " + currentModuleId, currentModuleContentType);
  //need index and column

  let moduleDiv = $(`.module[data-id='${currentModuleId}'`);

  // debugger;
  let source = await getModuleHierarchy(moduleDiv);

  let payload = { data: {} };
  payload.data.sectionId = currentSectionId;
  payload.data.rowIndex = currentRowIndex;
  payload.data.columnIndex = currentColumnIndex - 1;
  payload.data.moduleId = currentModuleId;
  payload.data.moduleIndex = currentModuleIndex;

  // payload.data.destinationSectionId = destinationSectionId;
  // payload.data.destinationRowIndex = destinationRowIndex;
  // payload.data.destinationColumnIndex = destinationColumnIndex;
  // payload.data.destinationModuleIndex = event.newIndex;
  // payload.data.destinationModules = destinationModules;

  return axiosInstance
    .post("/admin/pb-update-module-delete", payload)
    .then(async function (response) {
      // debugger;
      console.log(response);
      fullPageUpdate();
      // return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function cleanModal() {
  $("#moduleSettingsFormio").empty();
}

async function addModuleToColumn(submission) {
  // debugger;
  console.log("adding module to column", submission);

  //handling adding module def to db
  let entity = processContentFields(submission.data);
  let processedEntity;
  if (submission.data.id) {
    processedEntity = await editContentInstance(entity);
  } else {
    processedEntity = await createContentInstance(entity);
  }

  // generate short code ie: [MODULE-HELLO-WORLD id="123"]
  let args = { id: processedEntity.id };
  let moduleInstanceShortCode = sharedService.generateShortCode(
    `${submission.data.contentType}`,
    args
  );

  //add the shortCode to the column
  let section = await getContentInstance(currentSectionId);
  let column =
    section.data.rows[currentRowIndex].columns[currentColumnIndex - 1];
  column.content += moduleInstanceShortCode;
  editContentInstance(section);

  fullPageUpdate();
}

async function submitContent(submission, refresh = true) {
  // debugger;
  console.log("Submission was made!", submission);
  let entity = processContentFields(submission.data);
  if (submission.data.id) {
    await editContentInstance(entity, refresh);
  } else {
    await createContentInstance(entity);
  }
}

async function postProcessNewContent(content) {
  // debugger;
  if (content.contentType == "page") {
    if (content.includeInMenu) {
      //add to existing main menu
      // await editContentInstance(entity);
      let mainMenu = await getContentByContentTypeAndTitle("menu", "Main");
      let menuItem = {
        url: content.url,
        title: content.name,
        active: true,
        level: "0",
      };
      mainMenu.data.links.push(menuItem);
      await editContentInstance(mainMenu);
    }
  }
}

//TODO, make this just refresh the body content with a full get
function fullPageUpdate() {
  console.log("refreshing page");
  location.reload();
}

async function redirect(url) {
  // debugger;
  console.log("redirecting page");
  // window.location.href = url;
  window.location.replace(url);
  return false;
}

async function writeFile(container, file) {
  let formData = new FormData();
  formData.append("file", file);

  axiosInstance
    .post(`/api/containers/${container}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(function () {
      console.log("SUCCESS!!");
    })
    .catch(function () {
      console.log("FAILURE!!");
    });
}

async function setupACEEditor() {
  if ($("#editor").length === 0) {
    return;
  }

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/css");
  // editor.session.setDocument("ace/mode/css");
  // editor.session.setTabSize(0);
  // editor.session.setUseSoftTabs(false);
  // editor.session.setOption('enableLiveAutocompletion', true)

  // editor.getSession().on('loaded', function () {
  //     console.log('on blur')
  //     var beautify = ace.require("ace/ext/beautify"); // get reference to extension
  //     var editor = ace.edit("editor"); // get reference to editor
  //     beautify.beautify(editor.session);
  // });

  editor.getSession().on("change", function () {
    update();

    // var beautify = ace.require("ace/ext/beautify"); // get reference to extension
    // var editor = ace.edit("editor"); // get reference to editor
    // beautify.beautify(editor.session);
  });

  function update() {
    //writes in <div> with id=output
    var val = editor.getSession().getValue();
    // console.log(val);
    $("#templateCss").html(val);
  }

  $("#save-global-css").click(function () {
    let cssContent = editor.getSession().getValue();
    let file = new File([cssContent], "template.css", { type: "text/css" });
    writeFile("css", file);
  });

  beatifyACECss();
}

async function setupDropZone() {
  Dropzone.autoDiscover = false;

  var myDropzone = $("#sonicjs-dropzone").dropzone({
    url: "/api/containers/files/upload",
    addRemoveLinks: true,
    maxFilesize: 5,
    dictDefaultMessage:
      '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Drop files <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (Or Click)</h4></span>',
    dictResponseError: "Error uploading file!",
    headers: {
      Authorization: $("#token").val(),
    },
    accept: async function (file, done) {
      let title = file.name.replace(/\.[^/.]+$/, "");
      let payload = {
        data: {
          title: title,
          file: file.name,
          contentType: "media",
        },
      };
      await createContentInstance(payload);
      done();
    },
  });

  // debugger;
  // Dropzone.options.myDropzone = {
  //     paramName: "file", // The name that will be used to transfer the file
  //     maxFilesize: 2, // MB
  //     accept: function(file, done) {
  //       if (file.name == "justinbieber.jpg") {
  //         done("Naha, you don't.");
  //       }
  //       else { done(); }
  //     }
  //   };

  // Dropzone.autoDiscover = false;

  // let sonicDropzone = $("#sonicjs-dropzone").dropzone({
  //     url: "/api/containers/files/upload",
  //     addRemoveLinks : true,
  //     maxFilesize: 5,
  //     dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Drop files <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (Or Click)</h4></span>',
  //     dictResponseError: 'Error uploading file!',
  //     headers: {
  //         'Authorization': $('#token').val()
  //     }
  // });

  // sonicDropzone.on("complete", function (file) {
  //     debugger;
  // });
}

async function beatifyACECss() {
  if (typeof ace !== "undefined") {
    var beautify = ace.require("ace/ext/beautify"); // get reference to extension
    var editor = ace.edit("editor"); // get reference to editor
    beautify.beautify(editor.session);
  }
}

async function setupSortable() {
  let columnsList = $('main div[class^="col"]');
  var columns = jQuery.makeArray(columnsList);

  // console.log("columns", columns);
  columns.forEach((column) => {
    setupSortableColum(column);
  });
}

async function setupSortableColum(el) {
  // var el = document.getElementById("main");
  // var el = document.getElementsByClassName("col-md-9")[0];

  if (typeof Sortable !== "undefined") {
    var sortable = new Sortable(el, {
      // Element dragging ended
      group: "shared",
      onEnd: function (/**Event*/ event) {
        var itemEl = event.item; // dragged HTMLElement
        event.to; // target list
        event.from; // previous list
        event.oldIndex; // element's old index within old parent
        event.newIndex; // element's new index within new parent
        event.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
        event.newDraggableIndex; // element's new index within new parent, only counting draggable elements
        event.clone; // the clone element
        event.pullMode; // when item is in another sortable: `"clone"` if cloning, `true` if moving
        updateModuleSort(itemEl, event);
      },
    });
  }
}

async function getModuleHierarchy(element) {
  let sourceSectionHtml = $(element)[0].closest("section");
  let sourceSectionId = sourceSectionHtml.dataset.id;
  let sourceRow = $(element)[0].closest(".row");
  let sourceRowIndex = $(sourceRow).index();
  let sourceColumn = $(element)[0].closest('div[class^="col"]');
  let sourceColumnIndex = $(sourceColumn).index();

  return {
    sourceSectionHtml: sourceSectionHtml,
    sourceSectionId: sourceSectionId,
    sourceRow: sourceRow,
    sourceRowIndex: sourceRowIndex,
    sourceColumn: sourceColumn,
    sourceColumnIndex: sourceColumnIndex,
  };
}

async function updateModuleSort(shortCode, event) {
  //source
  let source = await getModuleHierarchy(event.from);
  // let sourceSectionHtml = $(event.from)[0].closest("section");
  // let sourceSectionId = sourceSectionHtml.dataset.id;
  // let sourceRow = $(event.from)[0].closest(".row");
  // let sourceRowIndex = $(sourceRow).index();
  // let sourceColumn = $(event.from)[0].closest('div[class^="col"]');
  // let sourceColumnIndex = $(sourceColumn).index();

  //destination
  // debugger;
  let destinationSectionHtml = $(event.to)[0].closest("section");
  let destinationSectionId = destinationSectionHtml.dataset.id;
  let destinationRow = $(event.to)[0].closest(".row");
  let destinationRowIndex = $(destinationRow).index();
  let destinationColumn = $(event.to)[0].closest('div[class^="col"]');
  let destinationColumnIndex = $(destinationColumn).index();

  //get destination list of modules in their updated sort order
  let destinationModules = $(destinationColumn)
    .find(".module")
    .toArray()
    .map(function (div) {
      let shortCodeData = { id: div.dataset.id, module: div.dataset.module };
      return shortCodeData;
    });
  console.log("destinationModules", destinationModules);

  let payload = { data: {} };
  payload.data.sourceSectionId = source.sourceSectionId;
  payload.data.sourceRowIndex = source.sourceRowIndex;
  payload.data.sourceColumnIndex = source.sourceColumnIndex;
  payload.data.sourceModuleIndex = event.oldIndex;
  payload.data.destinationSectionId = destinationSectionId;
  payload.data.destinationRowIndex = destinationRowIndex;
  payload.data.destinationColumnIndex = destinationColumnIndex;
  payload.data.destinationModuleIndex = event.newIndex;
  payload.data.destinationModules = destinationModules;

  // debugger;
  return axiosInstance
    .post("/admin/pb-update-module-sort", payload)
    .then(async function (response) {
      console.log(response);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function setupSidePanel() {
  // console.log('setup side panel')
  $(".pb-side-panel .handle span").click(function () {
    $(".pb-side-panel").addClass("close");
    $(".pb-side-panel-modal-backdrop").addClass("close");
  });
}

function showSidePanel() {
  $(".pb-side-panel-modal-backdrop").removeClass("close");
  $(".pb-side-panel").removeClass("close");
}

function setupAdminMenuMinimizer() {
  $(".pb-wrapper .sidebar-minimizer").click(function () {
    Cookies.set("showSidebar", false);
    toggleSidebar(false);
  });

  $(".sidebar-expander").click(function () {
    Cookies.set("showSidebar", true);
    toggleSidebar(true);
  });

  if (isEditMode() === "true") {
    toggleSidebar(true);
  } else {
    toggleSidebar(false);
  }
}

function toggleSidebar(showSidebar) {
  if (showSidebar) {
    //opening
    $(".pb-wrapper").css("left", "0");
    $("main, .fixed-top, footer").css("margin-left", "260px");
    $(".sidebar-expander").css("left", "-60px");
    setupUIClicks();
  } else {
    //closing
    $(".pb-wrapper").css("left", "-260px");
    $("main, .fixed-top, footer").css("margin-left", "0");
    $(".sidebar-expander").css("left", "0");
    disableUIHoversAndClicks();
  }
}

function isEditMode() {
  let isEditMode = Cookies.get("showSidebar");
  return isEditMode;
}
