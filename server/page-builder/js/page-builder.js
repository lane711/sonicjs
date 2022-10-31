var page = {};
var contentType;
var contentTypeComponents;

var imageList,
  tinyImageList,
  currentSectionId,
  currentSection,
  currentSectionTitle,
  newSectionDirectionAbove = true,
  currentRow,
  currentRowIndex,
  currentColumn,
  currentColumnIndex,
  currentModuleId,
  currentModuleDiv,
  currentModuleIndex,
  currentModuleContentType,
  jsonEditor,
  ShortcodeTree,
  jsonEditorRaw,
  sessionID,
  theme,
  nextSelectedModule,
  unsavedChanedsModal,
  latestModuleDataFromForm,
  originalModuleDataFromDb,
  formSubmitted = false,
  newDrop = false;

$(document).ready(async function () {
  setupSessionID();
  setupThemeID();
  // setupUIHovers();
  setupUIClicks();
  setupClickEvents();
  setupJsonEditor();
  await setPage();
  await setContentType();
  setupJsonEditorContentTypeRaw();
  setupJsonRawSave();

  setupFormBuilder(contentType);
  await setupACEEditor();
  await setupDropZone();
  setupSortable();
  setupSidePanel();
  setupAdminMenuMinimizer();
  setupPopovers();
  setupElements();
  setupPageForm();
  setupSiteCss();
  showElements();
  setupFormIsLoadedEvent();
});

function setupSessionID() {
  sessionID = $("#sessionID").val();
}

function setupThemeID() {
  theme = $("#theme").val();
}

async function setPage() {
  let pageId = $("#page-id").val();
  if (pageId) {
    this.page = await dataService.getContentById(pageId);
  }
}

async function setContentType() {
  let contentTypeId = $("#contentTypeId").val();
  if (contentTypeId) {
    this.contentType = await dataService.contentTypeGet(contentTypeId, {
      req: { sessionID: sessionID },
    });
  }
}

function axiosTest() {
  // console.log("running axios");
  axiosInstance
    .get("/api/content")
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed      // console.log("done axios");
    });
}

// function setupUIHovers() {
//   $(".pb-section").on({
//     mouseenter: function () {
//       let sectionId = getParentSectionId($(this));
//       $(`section[id='${sectionId}']`).addClass("section-highlight");
//     },
//     mouseleave: function () {
//       let sectionId = getParentSectionId($(this));
//       $(`section[id='${sectionId}']`).removeClass("section-highlight");
//     },
//   });
// }

function disableUIHoversAndClicks() {
  $(".pb-section").off();

  $("section .row > *").off();
  $("section .row .module").off();
  removeAllHighlights();
  // $(".edit-module").hide();
  // $(".section-editor-button").hide();
}

function removeAllHighlights() {
  // $(".row-highlight").removeClass("row-highlight");
  // $(".col-highlight").removeClass("col-highlight");
  // $(".block-edit").removeClass("block-edit");
  // $("html").removeClass("pb");
}

function disableAllModuleLinks() {
  //disable hyperlinks in module so that user can select it
  if (isEditMode()) {
    $("section").find("a").attr("href", "javascript:void(0);");
  }
}

function setupUIClicks() {
  $("html").addClass("pb");

  // $("section .row > *").on({
  //   click: function () {
  //     // debugger;
  //     $(".col-highlight").removeClass("col-highlight");
  //     $(".block-edit").removeClass("block-edit");
  //     currentSectionId = $(this).closest("section").data("id");
  //     if (currentSectionId) {
  //       currentRow = $(this).closest(".row")[0];
  //       $(this).closest(".row").addClass("row-highlight");
  //       currentRowIndex = $(this).closest(".row").index();
  //       console.log("currentRowIndex pbcol", currentRowIndex);
  //       currentColumnIndex = $(this).index() + 1;
  //       currentColumn = $(this);
  //       currentColumn.addClass("col-highlight");
  //       $(".col-button").show().appendTo(currentColumn);
  //       $(".add-module").show().appendTo(currentColumn);
  //       $(".row-button").show().appendTo(currentRow);
  //     }
  //   },
  // });

  // debugger;

  //   $('.module-hover-wrap a').click(function(e) {
  //     debugger;
  //     e.preventDefault();
  //     //do other stuff when a click happens
  // });

  //   $("section .row .module").on({
  //     mouseenter: function () {
  //         //stuff to do on mouse enter
  //         console.log("hovering", this);
  //         //wrap inner content in case there are hyperlinks
  //         // $(this).wrap(function() {
  //         //   return "<a href='javascript:void(0);' class='module-hover-wrap'></a>";
  //         // });

  //         $('section').find('a').attr('href', '#');

  //     },
  //     mouseleave: function () {
  //         //stuff to do on mouse leave
  //         console.log("leaving", this);
  //         // $(this).unwrap();
  //     }
  // });

  $(document).on("click", ".pb section .row .module", function () {
    if ($(this).hasClass("cloned")) {
      return;
    }

    nextSelectedModule = this;
    if (!checkForUnsavedChanges()) {
      selectNextModule();
    } else {
      unsavedChanedsModal = new bootstrap.Modal(
        document.getElementById("unsavedChanedsModal"),
        {
          keyboard: false,
        }
      );
      unsavedChanedsModal.show();
    }
  });

  $(document).on("click", ".cancel-panel", function () {
    if (!checkForUnsavedChanges()) {
      showElements();
    } else {
      unsavedChanedsModal = new bootstrap.Modal(
        document.getElementById("unsavedChanedsModal"),
        {
          keyboard: false,
        }
      );
      unsavedChanedsModal.show();
    }
  });

  $(document).on("click", ".empty-column", function () {
    let moduleDiv = $(this).closest(".col")[0];
    setCurrentIds(moduleDiv, undefined, true);
  });

  $("#unsavedLooseChanges").on("click", function () {
    //need to revert/reset module
    renderSectionOrModule(originalModuleDataFromDb);
    selectNextModule();
  });

  $("#unsavedSaveChanges").on("click", async function () {
    unsavedChanedsModal.hide();
    // formIsDirty = false;
    // await     clickFormUpdateButton();
    await submitContent(latestModuleDataFromForm, false, "content", true);
    selectNextModule();
    // $('.submit-alert').remove();
  });

  $(document).on("click", "#reset-module", function () {
    //need to revert/reset module

    resetModule();
  });
}
function resetModule() {
  renderSectionOrModule(originalModuleDataFromDb);
  // $(".submit-alert").remove();
  editModule(sessionID);
  // formIsDirty = false;
}

function checkForUnsavedChanges() {
  return typeof formIsDirty !== "undefined" && formIsDirty === true;
}

function selectNextModule() {
  hideSiteCss();
  originalModuleDataFromDb = {};
  let moduleDiv = $(nextSelectedModule).closest(".module")[0];
  console.log("module click", moduleDiv);
  setCurrentIds(moduleDiv.dataset.id);
  editModule(sessionID);
}

function setMainPanelHeaderTextAndIcon(text, icon) {
  $(".main .header .icon i").removeClass();
  $(".main .header .icon i").addClass(`bi header-icon ${icon}`);
  $(".main .header .panel-title").text(text);
}

function setCurrentIds(moduleId, newDrop = false, emptyColumn = false) {
  let moduleDiv;
  if (newDrop) {
    moduleDiv = $(".current-drop")[0];
  } else if (emptyColumn && moduleId) {
    moduleDiv = moduleId;
  } else if (moduleId) {
    moduleDiv = $(`div[data-id="${moduleId}"]`)[0];
  } else {
    //user has selected empty column
    return;
  }

  currentModuleDiv = moduleDiv;

  //remove "empty column"
  checkIfColumnIsEmpty($(currentModuleDiv).parent[0]);

  //reset
  $(".module-highlight").removeClass("module-highlight");
  $(".current-section").removeClass("current-section");
  $(".edit-module.cloned").remove();

  if (!emptyColumn) {
    currentModuleId = moduleDiv.dataset.id;
    currentModuleIndex = $(moduleDiv).index();
    currentModuleContentType = moduleDiv.dataset.contentType;
  }
  currentSection = $(moduleDiv).closest("section")[0];
  currentSectionId = currentSection.dataset.id;
  currentSectionTitle = currentSection.dataset.title;
  $(".select-current-section").text(currentSectionTitle);
  $(".breadcrumbs").removeClass("hide");
  currentRow = $(moduleDiv).closest(".row");
  currentRowIndex = $(currentRow).index();
  currentColumn = $(moduleDiv).closest('div[class*="col"]');
  console.log("setting currentColumn", currentColumn);
  currentColumnIndex = $(currentColumn).index();

  console.log(
    `setting current ids, section: ${currentSectionId}, moduleId: ${currentModuleId}`
  );
  $(moduleDiv).addClass("module-highlight");
  $(currentSection).addClass("current-section");

  if (!emptyColumn) {
    $(".edit-module").clone().addClass("cloned").appendTo(moduleDiv).show();
    if (!$(".section-add-above.cloned").length) {
      $(".section-add-above").prependTo(currentSection).show();

      $(".section-add-below").appendTo(currentSection).show();
    }
  }

  disableAllModuleLinks();
  setupSortable();
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
  $(".section-add-above").on("click", async function () {
    newSectionDirectionAbove = true;
    $("#new-section").show();
    $("#new-section").insertBefore($(currentSection));
  });
  $(".section-add-below").on("click", async function () {
    newSectionDirectionAbove = false;
    $("#new-section").show();
    $("#new-section").insertAfter($(currentSection));
    //if new page, need to remoce the "this page has now sections div"
    $(".new-page-no-sections").remove();
  });

  $(".new-section .mini-layout").on("click", async function () {
    let layoutSizeArr = $(this).attr("class").split(" ");
    let layoutSize = layoutSizeArr[layoutSizeArr.length - 1];

    await addSection(newSectionDirectionAbove, layoutSize);
  });

  setupBreadcrumbEvents();
  // setupSectionBackgroundEvents();
}

async function addSection(above = true, layout) {
  console.log("adding section above:", above);
  let newColumns = generateNewColumns(layout);
  let rows = [
    {
      columns: newColumns,
      css: "row",
      styles: "",
    },
  ];

  //section
  let nextSectionCount = 1;
  if (page.data.layout) {
    nextSectionCount = page.data.layout.length + 1;
  }

  let section = {
    title: `Section ${nextSectionCount}`,
    contentType: "section",
    background: "none",
    rows: rows,
  };
  let s1 = await createInstance(section);

  //add to current page

  if (!page.data.layout) {
    page.data.layout = [];
  }

  let currentSectionIndex =
    page.data.layout.map((s) => s.sectionId).indexOf(currentSectionId) ?? 0;
  if (above) {
    page.data.layout.splice(currentSectionIndex, 0, { sectionId: s1.id });
  } else {
    page.data.layout.splice(currentSectionIndex + 1, 0, { sectionId: s1.id });
  }

  let updatedPage = await editInstance(page);

  fullPageUpdate();
}

function generateNewColumns(layout) {
  let columns = generateBootstrapColumns(["col-md-12"]);

  switch (layout) {
    case "full":
      break;
    case "half":
      columns = generateBootstrapColumns(["col-md-6", "col-md-6"]);
      break;
    case "thirds":
      columns = generateBootstrapColumns(["col-md-4", "col-md-4", "col-md-4"]);
      break;
    case "forths":
      columns = generateBootstrapColumns([
        "col-md-3",
        "col-md-3",
        "col-md-3",
        "col-md-3",
      ]);
      break;
    case "left-sidebar":
      columns = generateBootstrapColumns(["col-md-3", "col-md-9"]);
      break;
    case "right-sidebar":
      columns = generateBootstrapColumns(["col-md-9", "col-md-3"]);
      break;
    case "both-sidebars":
      columns = generateBootstrapColumns(["col-md-3", "col-md-6", "col-md-3"]);
      break;
    default:
      break;
  }

  return columns;
}

function generateBootstrapColumns(classList) {
  // debugger;
  let list = classList.map((bsClass) => ({
    css: bsClass,
    content: [
      {
        content: "",
      },
    ],
  }));

  return list;
}

async function getCurrentSection() {
  currentSectionRecord = await dataService.getContentById(currentSectionId);
  return currentSectionRecord;
}
async function setupBreadcrumbEvents() {
  $(".select-current-section").on("click", async function () {
    console.log("current section", currentSectionId);

    // debugger;
    let data = await dataService.getContentById(currentSectionId);
    let form = await dataService.formGet(
      "section",
      data,
      "await submitContent(submission);",
      false,
      undefined,
      sessionID
    );

    $("#pb-content-container").html(form.html);
    loadModuleSettingForm();

    //seup color pickers
    // setupColorPicker(currentSectionId);
  });

  // $(".select-current-row").on("click", async function () {
  //   console.log("current row", currentRow);
  // });

  // $(".select-current-column").on("click", async function () {
  //   console.log("current column", currentColumn);
  // });
}

// async function setupSectionBackgroundEvents() {
//   $(".section-background-editor button").on("click", async function () {
//     let backgroundSetting = $(this).data("type");
//     currentSectionId = $(this).data("section-id");
//     setupColorPicker(currentSectionId);

//     currentSectionRecord = await getCurrentSection();
//     // debugger;
//     currentSectionRecord.data.background = { type: backgroundSetting };
//     // setDefaultBackgroundSetting(currentSectionRecord);
//     showBackgroundTypeOptions(backgroundSetting, currentSectionId);

//     editInstance(currentSectionRecord);
//   });

//   $(".pb .layout .background-image-link").on("click", async function () {
//     $("#genericModal").on("show.bs.modal", function () {
//       // alert("load");

//       $(".image-module-list-item").on("click", function () {
//         console.log("image-module-list-item", $(this).text());
//       });

//       // debugger;
//       //  const element = $(".section-background .choices .choices__input")[0]
//       const example = new Choices(
//         $(".section-background .choices .choices__input")[0]
//       );

//       example.passedElement.element.addEventListener(
//         "addItem",
//         async function (event) {
//           // do something creative here...
//           // console.log(event.detail.id);
//           console.log(event.detail.value.src);
//           // console.log(event.detail.label);
//           // console.log(event.detail.customProperties);
//           // console.log(event.detail.groupValue);
//           // debugger;
//           $(`section[data-id="${currentSectionId}"]`)
//             .css("background", `url(${event.detail.value.src})`)
//             .addClass("bg-image-cover");

//           //save
//         },
//         false
//       );
//     });
//   });
// }

async function setDefaultBackgroundSetting(currentSectionRecord, color) {
  currentSectionRecord.data.background.color = color;
}

async function saveSectionBackgroundImage() {
  debugger;
  console.log("submittedFormData", submittedFormData);
  // alert("saving saveSectionBackgroundImage...");
  currentSectionRecord = await getCurrentSection();
  currentSectionRecord.data.background = {
    type: "image",
    src: event.detail.value.src,
    css: "bg-image-cover",
  };
  editInstance(currentSectionRecord);
}

async function showBackgroundTypeOptions(backgroundSetting, sectionId) {
  $("[id^=background-]").hide();
  let selector = `[id='background-${backgroundSetting}'],[data-id='${sectionId}']`;
  $(selector).show();
}

function setupFormIsLoadedEvent() {
  const visibleProp = Object.getOwnPropertyDescriptor(
    Formio.Components.components.component.prototype,
    "visible"
  );
  const setVisible = visibleProp.set;
  visibleProp.set = function (visible) {
    if (visible) {
      if (this.component.customClass.includes("color-picker")) {
        setupColorPicker(`${this.component.id}-${this.component.key}`);
      }
    }
    return setVisible.call(this, visible);
  };
  Object.defineProperty(
    Formio.Components.components.component.prototype,
    "visible",
    visibleProp
  );
}

async function setupColorPicker(id) {
  let buttonId = `color-picker-button-${id}`;

  waitForElm(`.color-picker-append`).then((elm) => {
    console.log("Element is ready");
    $(`<input type="text" id="${buttonId}">`).insertAfter($(`#${id}`));
    let color = $(`#${id}`).val();
    addColorPicker(id, buttonId, color);
  });
}

async function addColorPicker(textBoxId, buttonId, color) {
  let pickr = Pickr.create({
    el: `#${buttonId}`,
    appClass: "color-picker-button",
    // useAsButton: true,
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
        save: false,
      },
    },
  });

  pickr.on("init", () => {
    console.log("setting color picker");
    pickr.setColor(color);
  });

  pickr.on("change", async (color, instance) => {
    // debugger;
    pickr.applyColor();

    const componentName = textBoxId.split("-")[1];

    console.log("setting component color", componentName);
    currentForm
      .getComponent(componentName)
      .setValue(color.toRGBA().toString(3));

    console.log("change", buttonId, color, instance);
    // $(`#${textBoxId}`).val(color.toRGBA().toString(3));

    // $(`#${textBoxId}`).keypress();
    // $(`section[data-id="${currentSectionId}"]`).css(
    //   "background-color",
    //   color.toHEXA()
    // );
  });
  // .on("save", async (color, instance) => {
  //   console.log("save", color, instance);
  //   currentSectionRecord = await getCurrentSection();
  //   currentSectionRecord.data.background = {
  //     type: "color",
  //     color: color.toRGBA().toString(3),
  //   };
  //   editInstance(currentSectionRecord);
  // });
}

function getHtmlHex(hex) {
  return hex;
  // return hex.substring(0,7);
}

async function editSection(sectionId) {
  console.log(sectionId);
  currentSectionRecord = await dataService.getContentById(sectionId);
  currentSection = currentSectionRecord.data;
  console.log("currentSection", currentSection);
  // $('#section-editor').text(JSON.stringify(currentSection));
  loadJsonEditor();
  $("#sectoinEditorModal").appendTo("body").modal("show");
}

async function deleteSection(sectionId, index) {
  // debugger;
  console.log("delete section", sectionId, index);
  //delete from page
  page.data.layout.splice(index, 1);
  await editInstance(page);

  //delete section
  await deleteContentInstance(sectionId);
  fullPageUpdate();
}

async function saveSection() {
  var sectionData = jsonEditor.get();
  console.log("jsonEditor", sectionData);
  await editInstance(sectionData);
  fullPageUpdate();

  // console.log(sectionId);
  // currentSectionRecord = await dataService.getContentById(sectionId);
  // currentSection = currentSectionRecord.data;
  // console.log('currentSection', currentSection);
  // $('#section-editor').text(JSON.stringify(currentSection));
  // $('#sectoinEditorModal').appendTo("body").modal('show');
}

// async function addRow(sectionId) {
//     console.log('adding row to section: ' + sectionId);
//     let row = await this.generateNewRow();

//     let section = await dataService.getContentById(sectionId);
//     section.data.rows.push(row);
//     editInstance(section);

//     fullPageUpdate();
// }

async function addRow() {
  let row = await this.generateNewRow();

  let section = await dataService.getContentById(currentSectionId);
  section.data.rows.push(row);
  editInstance(section);

  fullPageUpdate();
}

// async function addColumn(sectionId, rowIndex) {
//     console.log('adding column ', sectionId, rowIndex);
//     let section = await dataService.getContentById(sectionId);
//     console.log('secton', section);
//     let column = await generateNewColumn();
//     section.data.rows[rowIndex].columns.push(column);
//     console.log('columns', section.data.rows[rowIndex].columns);
//     editInstance(section);

//     fullPageUpdate();
// }

async function addColumn() {
  // debugger;
  let section = await dataService.getContentById(currentSectionId);
  console.log("secton", section);
  console.log("currentRowIndex", currentRowIndex);

  let column = await generateNewColumn();
  section.data.rows[currentRowIndex].columns.push(column);
  // console.log("columns", section.data.rows[currentRowIndex].columns);
  editInstance(section);

  fullPageUpdate();
}

async function deleteColumn() {
  let section = await dataService.getContentById(currentSectionId);
  section.data.rows[currentRowIndex].columns.splice(currentColumnIndex - 1, 1);

  //TODO, delete block too

  editInstance(section);

  fullPageUpdate();
}

async function deleteRow() {
  let section = await dataService.getContentById(currentSectionId);
  debugger;
  section.data.rows.splice(currentRowIndex, 1);
  editInstance(section);
  fullPageUpdate();
}

async function editColumnContent() {
  console.log(currentSectionId);
  editSection(currentSectionId);
}

async function deleteBlock() {
  let section = await dataService.getContentById(currentSectionId);
  section.data.rows[currentRowIndex].columns.splice(currentColumnIndex - 1, 1);

  //TODO, delete block too

  editInstance(section);

  fullPageUpdate();
}

async function getContentInstance(id) {
  return axiosInstance
    .get(`/api/content/${id}`)
    .then(async function (response) {
      // console.log(response);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

// async function getContentByContentTypeAndTitle(contentType, title) {
//   const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
//   const encodedFilter = encodeURI(filter);
//   let url = `/api/content?filter=${encodedFilter}`;
//   return axiosInstance
//     .get(url)
//     .then(async function (record) {
//       if (record.data[0]) {
//         return record.data[0];
//       }
//       return "not found";
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }

async function editInstanceUser(payload, refresh, contentType = "content") {
  // let id = payload.id;
  // if (payload.id) {
  //   delete payload.id;
  // }
  // if (payload.data && payload.data.id) {
  //   id = payload.data.id;
  //   delete payload.data.id;
  // }
  // if (contentType === "users") {
  //   if (payload.data && payload.data.password) {
  //     payload.password = payload.data.password;
  //   }
  //   if (payload.data && payload.data.email) {
  //     payload.email = payload.data.email;
  //   }
  // }

  // debugger;
  await dataService.userUpdate(payload);

  fullPageUpdate();
  //update user
  // return axiosInstance
  //   .put(`/api/${contentType}/${id}`, payload)
  //   .then(async function (response) {
  //     // debugger;
  //     console.log("editInstance", response);
  //     // resolve(response.data);
  //     // return await response.data;
  //     debugger;
  //     if (response.data.data.url) {
  //       fullPageUpdate(response.data.data.url);
  //     } else if (refresh) {
  //       fullPageUpdate();
  //     }
  //   })
  //   .catch(function (error) {
  //     // debugger;
  //     console.log("editInstance", error);
  //   });
}

async function editContentType(payload, sessionID) {
  dataService.contentTypeUpdate(payload, sessionID);
}

async function deleteContentInstance(id, sessionID) {
  // debugger;
  await dataService.contentDelete(id, sessionID);
}

async function deleteContentType(id) {
  console.log("deleting content", id);
  // return this.http.put(environment.apiUrl + `content/${id}`, payload).toPromise();
  axiosInstance
    .post(`/api/modules/deleteModuleContentType/`, { systemId: id })
    .then(async function (response) {
      console.log(response);
      // redirect("/admin/content-types");
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function userDelete(id, sessionID) {
  dataService.userDelete(id, sessionID);
}

function processContentFields(payload) {
  return { id: payload.id, data: payload };
}

async function openPageSettingsForm(action, contentType) {
  await setupPageSettings(action, contentType);
  $("#pageSettingsModal").appendTo("body").modal("show");
}

async function setupPageSettings(action, contentType, sessionID) {
  console.log("setupPageSettings");
  let pageId = $("#page-id").val();
  // let page = await dataService.getContentById(pageId);

  // Formio.createForm(document.getElementById('formio'), {
  // debugger;

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

  let form = undefined;

  if (action == "edit" && contentType) {
    formValuesToLoad = this.page;

    form = await dataService.formGet(
      contentType,
      formValuesToLoad,
      "await submitContent(submission);",
      undefined,
      undefined,
      sessionID
    );
  }

  if (action == "add") {
    // components.find(({ key }) => key === 'id' ).remove();
    componentsToLoad = components.filter((e) => e.key !== "id");

    // debugger;

    form = await dataService.formGet(
      "page",
      undefined,
      "await submitContent(submission);",
      undefined,
      undefined,
      sessionID
    );
  }

  $("#formio").html(form.html);
  loadModuleSettingForm();

  $("#genericModal").appendTo("body").modal("show");
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
      form.on("formLoad", async function (event) {
        debugg;
        if (event.components) {
          contentTypeComponents = event.components;
        }
      });
    }
  );
}

async function onContentTypeSave() {
  if (contentTypeComponents) {
    console.log("contentTypeComponents", contentTypeComponents);
    contentType.data.components = contentTypeComponents;
    if (!contentType.id) {
      contentType.id = $("#createContentTypeForm #id").val();
    }

    //form
    await editContentType(contentType, sessionID);

    fullPageUpdate();
  }
}

async function onContentTypeStatesSave(submission) {
  //states
  // processContentTypeStates(contentType);

  // //post submission
  // processPostSubmission(contentType);

  // //modal settings
  // processModalSettings(contentType);
  debugger;

  //add states form data to content type
  contentType.data.states = submission.data;

  await editContentType(contentType, sessionID);

  fullPageUpdate();
}

function processContentTypeStates(contentType) {
  contentType.data.states = {
    new: {
      buttonText: $("#addText").val() ?? "Submit",
    },
    edit: {
      buttonText: $("#editText").val() ?? "Submit",
    },
  };
}

// function processPostSubmission(contentType) {
//   debugger;
//   let action = "fullPageRefresh";
//   let redirectUrl = $("#redirectUrl").val();
//   let message = $("#showMessageCopy").val();
//   let callFunction = $("#callFunctionName").val();

//   if ($("#redirectToUrl").prop("checked")) {
//     action = "redirectToUrl";
//   }

//   if ($("#showMessage").prop("checked")) {
//     action = "showMessage";
//   }

//   if ($("#doNothing").prop("checked")) {
//     action = "doNothing";
//   }

//   if ($("#callFunction").prop("checked")) {
//     action = "callFunction";
//   }

//   contentType.data.postSubmission = {
//     action,
//     redirectUrl,
//     message,
//     callFunction,
//   };
// }

function processModalSettings(contentType) {
  let modalTitle = $("#modalTitle").val();

  contentType.data.modalSettings = {
    modalTitle,
  };
}

async function onContentTypeRawSave() {
  // debugger;
  var contentType = jsonEditorRaw.get();
  console.log("jsonEditor", contentType);
  await editContentType(contentType, sessionID);
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

async function openNewRoleModal() {
  $("#newRoleModal").appendTo("body").modal("show");
}

async function openWYSIWYG() {
  console.log("WYSIWYG setup");
  // $('section span').on("click", async function () {
  var id = $(".block-edit").data("id");
  console.log("span clicked " + id);
  $("#block-edit-it").val(id);
  $("#wysiwygModal").appendTo("body").modal("show");

  var content = await dataService.getContentById(id);

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
    // debugger;
    let rawData = jsonEditorRaw.get();
    console.log("json save");
    let contentId = $("#contentId").val();
    let json = rawData;
    let refresh = true;
    if (rawData.contentType !== "user") {
      json = { data: rawData };
      json.data.id = contentId;
      // refresh = false;
    }

    submitContent(json, refresh, json.contentType);
  });
}

async function getImageList() {
  let imageList = await dataService.getFiles();
  // let imageList = await axiosInstance.get(`/api/containers/container1/files`);
  // console.log('imageList', imageList.data);

  tinyImageList = [];

  imageList.data.forEach((image) => {
    let imageItem = {
      title: image.name,
      filePath: `/api/containers/${image.container}/download/${image.name}`,
    };
    tinyImageList.push(imageItem);
  });
}

async function saveWYSIWYG() {
  let id = $(".block-edit").data("id");
  console.log("saving " + id);

  let content = $("textarea.wysiwyg-content").html();

  //update db
  let block = await dataService.getContentById(id);
  block.data.body = content;
  editInstance(block);

  //update screen
  $(".block-edit").children().first().html(content);
  // $(`span[data-id="${id}"]`).html(content);

  //re-add block edit
  $(".block-button").show().appendTo($(".block-edit"));

  fullPageUpdate();
}

async function addModule(systemId, sessionID) {
  // debugger;
  currentModuleContentType = systemId;

  let form = await dataService.formGet(
    systemId,
    undefined,
    `addModuleToColumn(submission, false, undefined, "${systemId} Module Added")`,
    false,
    undefined,
    sessionID
  );

  console.log("adding module type:", form.contentType.systemId);

  setMainPanelHeaderTextAndIcon(systemId, form.contentType.module.icon);

  $("#pb-content-container").html(form.html);
  // $(".pb-side-panel #main").html(form.html);

  loadModuleSettingForm();
  // $("#moduleSettingsModal")
  //   .appendTo("body")
  //   .modal("show");
}

async function editModule(sessionID) {
  if (!currentModuleId) {
    //newdrop unsaved
    addModule(currentModuleContentType, sessionID);
    return;
  }

  console.log("editing module: " + currentModuleId, currentModuleContentType);

  let data = await dataService.getContentById(currentModuleId);

  // if (!data) {
  //   //newdrop unsaved
  //   data = originalModuleDataFromDb;
  // }

  let message = `Updated ${currentModuleContentType} module`;
  // debugger;
  let form = await dataService.formGet(
    currentModuleContentType,
    data,
    `await updatePBModule(submission, false, undefined, "${message}");`,
    true,
    undefined,
    sessionID
  );

  setMainPanelHeaderTextAndIcon(
    currentModuleContentType,
    form.contentType.module.icon
  );

  // $("#dynamicModelTitle").text(
  //   `Settings: ${currentModuleContentType} (Id:${currentModuleId})`
  // );

  // $("#moduleSettingsFormio").html(form);
  // $(".pb-side-panel #main").html(form.html);
  $("#pb-content-container").html(form.html);
  loadModuleSettingForm();
  // $("#moduleSettingsModal")
  //   .appendTo("body")
  //   .modal("show");
}

async function updatePBModule(
  payload,
  refresh,
  contentType = "content",
  growlMessage
) {
  console.log("updatePBModule", payload);
  formSubmitted = true;
  await editInstance(payload, false, undefined, growlMessage);
  //reset form
  // await editModule(sessionID);
}

async function deleteModule() {
  showSidePanel();

  let data = await dataService.getContentById(currentModuleId);

  $("#dynamicModelTitle").text(
    `Delete: ${currentModuleContentType} (Id:${currentModuleId}) ?`
  );

  let confirmDeleteButton = `<div class="btn-group">
    <button type="button" onclick="deleteModuleConfirm(true)" class="btn btn-danger">Delete Content and Remove from Column</button>
    <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div class="dropdown-menu">
      <a class="dropdown-item" onclick="deleteModuleConfirm(false)" href="#">Remove From Column Only</a>
    </div>
  </div>`;

  let dataPreview = `<div class="delete-data-preview""><textarea>${JSON.stringify(
    data,
    null,
    4
  )}</textarea></div>`;

  $(".pb-side-panel #main").html(confirmDeleteButton + dataPreview);
}

async function deleteModuleConfirm(deleteContent = false) {
  console.log("deleteing module: " + currentModuleId, currentModuleContentType);

  let moduleDiv = $(`.module[data-id='${currentModuleId}'`);
  let {
    isPageUsingTemplate,
    sourcePageTemplateRegion,
    destinationPageTemplateRegion,
  } = getPageTemplateRegion(page, currentColumn[0], currentColumn[0]);

  // debugger;
  let source = await getModuleHierarchy(moduleDiv);

  let payload = { data: {} };
  payload.data.sectionId = currentSectionId;
  payload.data.rowIndex = currentRowIndex;
  payload.data.columnIndex = currentColumnIndex;
  payload.data.moduleId = currentModuleId;

  //need to ignore template regions
  payload.data.moduleIndex = currentModuleIndex;
  payload.data.isPageUsingTemplate = isPageUsingTemplate;
  payload.data.pageTemplateRegion = sourcePageTemplateRegion;
  payload.data.pageId = page.id;
  payload.data.deleteContent = deleteContent;

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

async function resizeLeft(event) {
  console.log("shrinking column", currentColumn);
  await setNewColumnSize(-1);
}

async function resizeRight(event) {
  console.log("expanding column");
  await setNewColumnSize(1);
}

async function setNewColumnSize(diff) {
  // ui
  let currentClasses = currentColumn.attr("class").split(" ");
  let currentColClass = currentClasses.filter((c) => c.includes("col"))[0];
  let currentColClassSize = parseInt(currentColClass.replace(/^\D+/g, ""));
  let newColClassSize = currentColClass.replace(
    currentColClassSize,
    currentColClassSize + parseInt(diff)
  );

  $(currentColumn).removeClass(currentColClass).addClass(newColClassSize);

  //save to db
  let section = await dataService.getContentById(currentSectionId);
  let column = section.data.rows[currentRowIndex].columns[currentColumnIndex];
  column.css = newColClassSize;
  await editInstance(
    section,
    false,
    "section",
    "Column css class updated to " + newColClassSize
  );
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

  let {
    isPageUsingTemplate,
    sourcePageTemplateRegion,
    destinationPageTemplateRegion,
  } = getPageTemplateRegion(page, currentColumn[0], currentColumn[0]);

  payload.data.isPageUsingTemplate = isPageUsingTemplate;
  payload.data.sourcePageTemplateRegion = sourcePageTemplateRegion;
  payload.data.destinationPageTemplateRegion = destinationPageTemplateRegion;
  payload.data.pageId = page.id;

  ////////////////////
  // let moduleBeingMovedId = event.item.dataset.id;
  // let sourceColumn = $(event.from)[0].closest('div[class^="col"]');
  // let destinationColumn = $(event.to)[0].closest('div[class^="col"]');

  // let {
  //   isPageUsingTemplate,
  //   sourcePageTemplateRegion,
  //   destinationPageTemplateRegion,
  // } = getPageTemplateRegion(page, sourceColumn, destinationColumn);

  // //source
  // let source = await getModuleHierarchy(event.from);

  // //destination
  // let destinationSectionHtml = $(event.to)[0].closest("section");
  // let destinationSectionId = destinationSectionHtml.dataset.id;
  // let destinationRow = $(event.to)[0].closest(".row");
  // let destinationRowIndex = $(destinationRow).index();
  // let destinationColumnIndex = $(destinationColumn).index();

  // //get destination list of modules in their updated sort order
  // let destinationModules;
  // let destinationModuleFilter = isPageUsingTemplate
  //   ? "[data-template-region='true']"
  //   : ".module";

  // destinationModules = $(destinationColumn)
  //   .find(destinationModuleFilter)
  //   .toArray()
  //   .map(function (div) {
  //     let shortCodeData = { id: div.dataset.id, module: div.dataset.module };
  //     return shortCodeData;
  //   });

  // let payload = { data: {} };
  // payload.data.pageId = page.id;
  // payload.data.sourceSectionId = source.sourceSectionId;
  // payload.data.sourceRowIndex = source.sourceRowIndex;
  // payload.data.sourceColumnIndex = source.sourceColumnIndex;
  // payload.data.sourceModuleIndex = event.oldIndex;
  // payload.data.destinationSectionId = destinationSectionId;
  // payload.data.destinationRowIndex = destinationRowIndex;
  // payload.data.destinationColumnIndex = destinationColumnIndex;
  // payload.data.destinationModuleIndex = event.newIndex;
  // payload.data.destinationModules = destinationModules;
  // payload.data.isPageUsingTemplate = isPageUsingTemplate;
  // payload.data.sourcePageTemplateRegion = sourcePageTemplateRegion;
  // payload.data.destinationPageTemplateRegion = destinationPageTemplateRegion;
  // payload.data.moduleBeingMovedId = moduleBeingMovedId;
  /////////////////

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

async function cleanModal() {
  $("#moduleSettingsFormio").empty();
}

function getPageTemplateRegion(page, sourceColumn, destinationColumn) {
  let isPageUsingTemplate =
    page.data.pageTemplate && page.data.pageTemplate !== "none";

  let sourcePageTemplateRegion;
  let destinationPageTemplateRegion;

  if (isPageUsingTemplate) {
    // debugger;
    let sourceRegionModule = $(sourceColumn.children).filter(function () {
      return $(this).attr("data-module") == "PAGE-TEMPLATES";
    })[0];
    sourcePageTemplateRegion = $(sourceRegionModule).attr("data-id");

    let destinationRegionModule;

    if (destinationColumn) {
      destinationRegionModule = $(destinationColumn.children).filter(
        function () {
          return $(this).attr("data-module") == "PAGE-TEMPLATES";
        }
      )[0];
      destinationPageTemplateRegion = $(destinationRegionModule).attr(
        "data-id"
      );
    }
  }
  return {
    isPageUsingTemplate,
    sourcePageTemplateRegion,
    destinationPageTemplateRegion,
  };
}

async function addModuleToColumn(submission) {
  let entity = processContentFields(submission.data);

  let {
    isPageUsingTemplate,
    sourcePageTemplateRegion,
    destinationPageTemplateRegion,
  } = getPageTemplateRegion(page, currentColumn[0], currentColumn[0]);

  //handling adding module def to db
  let processedEntity;
  if (submission.data.id) {
    processedEntity = await editInstance(entity);
  } else {
    processedEntity = await createInstance(entity, false);
    //need to replace temporary div with the real one that included the id
    let moduleDiv = $('div[data-id="unsaved"]')[0];
    $(moduleDiv).data("id", processedEntity.id);
  }

  // generate short code ie: [MODULE-HELLO-WORLD id="123"]
  // debugger;
  let args = { id: processedEntity.id };
  let contentType = submission.data.contentType;
  if (contentType.indexOf("-settings") > -1) {
    contentType = contentType.replace("-settings", "");
  }
  let moduleInstanceShortCode = sharedService.generateShortCode(
    `${contentType}`,
    args
  );

  if (isPageUsingTemplate) {
    //if page uses a template, we need to attach the content to the selected region of the template
    if (!page.data.pageTemplateRegions) {
      //add empty region for new page
      page.data.pageTemplateRegions = [];
    }

    if (page.data.pageTemplateRegions) {
      let region = page.data.pageTemplateRegions.filter(
        (r) => r.regionId === destinationPageTemplateRegion
      );
      if (region && region.length > 0) {
        region[0].shortCodes += moduleInstanceShortCode;
      } else {
        page.data.pageTemplateRegions.push({
          regionId: destinationPageTemplateRegion,
          shortCodes: moduleInstanceShortCode,
        });
      }

      //save entire page, not just the section
      editInstance(page);
    }
    //save in a
  } else {
    //add the shortCode to the column
    let section = await dataService.getContentById(currentSectionId);
    let column = section.data.rows[currentRowIndex].columns[currentColumnIndex];
    column.content.push({ content: moduleInstanceShortCode });
    editInstance(section, false);
    //form should go from add to edit
    // setCurrentIds(processedEntity.id);
    // editModule(sessionID);
    addGrowl("Module added to column");
    //we should now reload section so we have the new module id
  }

  // fullPageUpdate();
}

// async function submitUser(submission, refresh = true) {
//   // debugger;
//   console.log("Submission was made!", submission);
//   let entity = processContentFields(submission.data);
//   entity.email = submission.data.email;
//   entity.password = submission.data.password;
//   delete entity.data.email;
//   delete entity.data.password;

//   debugger;
//   if (submission.data.id) {
//     await editInstance(entity, refresh);
//   } else {
//     await createInstance(entity, "users");
//   }
// }

async function postProcessNewContent(content) {
  // debugger;
  if (content.contentType == "page") {
    if (content.includeInMenu) {
      //add to existing main menu
      // await editInstance(entity);
      let mainMenu = await getContentByContentTypeAndTitle("menu", "Main");
      let menuItem = {
        url: content.url,
        title: content.name,
        active: true,
        level: "0",
      };
      mainMenu.data.links.push(menuItem);
      await editInstance(mainMenu);
    }
  }
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

  alert("not implemented");
  // axiosInstance
  //   .post(`/api/containers/${container}/upload`, formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   })
  //   .then(function () {
  //     console.log("SUCCESS!!");
  //   })
  //   .catch(function () {
  //     console.log("FAILURE!!");
  //   });
}

async function setupACEEditor() {
  if ($("#editor").length === 0) {
    return;
  }

  ace.config.set("basePath", "/node_modules/ace-builds/src-min-noconflict");
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/dreamweaver");
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

  $("#save-global-css").click(async function () {
    let cssContent = editor.getSession().getValue().toString();
    // debugger;

    return axiosInstance
      .post("/admin/update-css", { css: cssContent })
      .then(async function (response) {
        console.log(response);
        addGrowl("CSS Updated");
      })
      .catch(function (error) {
        console.log(error);
        alert(error);
      });
  });

  beatifyACECss();
}

async function setupDropZone() {
  if (!globalService.isBackEnd()) {
    return;
  }

  Dropzone.autoDiscover = false;

  var myDropzone = $(document.body).dropzone({
    url: "/dropzone-upload",
    addRemoveLinks: true,
    maxFilesize: 100,
    dictDefaultMessage:
      '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Drop files <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (Or Click)</h4></span>',
    dictResponseError: "Error uploading file!",
    headers: {
      Authorization: $("#token").val(),
    },
    addedfile: function (file) {
      console.log("dropzone adding file " + file.name);
      // var _this = this,
      //   reader = new FileReader();
      // reader.onload = async function (event) {
      //   debugger;
      //   base64content = event.target.result;
      //   console.log(base64content);
      //   await dataService.fileCreate(
      //     `/server/assets/uploads/${file.name}`,
      //     base64content
      //   );
      //   await createMediaRecord(file);
      //   _this.processQueue();
      //   wait(600); //HACK: need make fileCreate sync
      // };
      // reader.readAsDataURL(file);
    },
    complete: function () {
      console.log("dropzone complete");
    },
    accept: async function (file, done) {
      console.log("dropzone accept");
      done();
    },
    queuecomplete: function () {
      console.log("dropzone queuecomplete");
      fullPageUpdate();
    },
  });

  async function createMediaRecord(file) {
    let title = file.name.replace(/\.[^/.]+$/, "");
    let payload = {
      data: {
        title: title,
        file: file.name,
        contentType: "media",
      },
    };
    // debugger;
    await createInstance(payload);
  }
}

async function beatifyACECss() {
  if (typeof ace !== "undefined") {
    var beautify = ace.require("ace/ext/beautify"); // get reference to extension
    var editor = ace.edit("editor"); // get reference to editor
    beautify.beautify(editor.session);
  }
}

async function setupSortable() {
  let columnsList = $('.pb main div[class^="col"]');
  // TODO: limited this to only columns that are managed by page builder
  var columns = jQuery.makeArray(columnsList);

  // console.log("columns", columns);
  columns.map((column) => {
    setupSortableColum(column);
  });
}

async function setupSortableModules() {
  // debugger;
  let elementWrapper = $("#elements-list")[0];
  setupSortableModule(elementWrapper);

  // let newModuleList = $(".pb-wrapper .element-item");
  // var modules = jQuery.makeArray(newModuleList);
  // modules.map((newModule) => {
  //   setupSortableModule(newModule);
  // });
}

async function setupSortableColum(el) {
  if (typeof Sortable !== "undefined") {
    var sortable = new Sortable(el, {
      // Element dragging ended
      group: "shared",
      draggable: ".module",
      handle: ".module-move",
      onEnd: function (/**Event*/ event) {
        console.log("setupSortableColum onEnd");
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

async function setupSortableModule(el) {
  // debugger;

  if (typeof Sortable !== "undefined") {
    var sortable = new Sortable(el, {
      // Element dragging ended
      group: {
        name: "shared",
        pull: "clone",
        put: false, // Do not allow items to be put into this list
      },
      draggable: ".element-item",
      sort: false,
      onEnd: function (/**Event*/ event) {
        console.log("setupSortableModule onEnd");
        var itemEl = event.item; // dragged HTMLElement
        const item = $(itemEl);
        $("current-drop").removeClass("current-drop");
        item.addClass("current-drop");
        event.to; // target list
        event.from; // previous list
        event.oldIndex; // element's old index within old parent
        event.newIndex; // element's new index within new parent
        event.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
        event.newDraggableIndex; // element's new index within new parent, only counting draggable elements
        event.clone; // the clone element
        event.pullMode; // when item is in another sortable: `"clone"` if cloning, `true` if moving
        addModuleSort(item, event);
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

async function addModuleSort(item, event) {
  console.log("addModuleSort", item);

  newDrop = true;
  let systemId = event.item.dataset.moduleId;
  // let sourceColumn = $(event.from)[0].closest('div[class^="col"]');
  // let destinationColumn = $(event.to)[0].closest('div[class^="col"]');
  // console.log('adding to', destinationColumn);
  setCurrentIds(item, true);
  addModule(systemId, sessionID);
}
async function updateModuleSort(shortCode, event) {
  let moduleBeingMovedId = event.item.dataset.id;
  let sourceColumn = $(event.from)[0].closest('div[class^="col"]');
  let destinationColumn = $(event.to)[0].closest('div[class^="col"]');

  let {
    isPageUsingTemplate,
    sourcePageTemplateRegion,
    destinationPageTemplateRegion,
  } = getPageTemplateRegion(page, sourceColumn, destinationColumn);

  //source
  let source = await getModuleHierarchy(event.from);

  //destination
  let destinationSectionHtml = $(event.to)[0].closest("section");
  let destinationSectionId = destinationSectionHtml.dataset.id;
  let destinationRow = $(event.to)[0].closest(".row");
  let destinationRowIndex = $(destinationRow).index();
  let destinationColumnIndex = $(destinationColumn).index();

  //get destination list of modules in their updated sort order
  let destinationModules;
  let destinationModuleFilter = isPageUsingTemplate
    ? "[data-template-region='true']"
    : ".module";

  destinationModules = $(destinationColumn)
    .find(destinationModuleFilter)
    .toArray()
    .map(function (div) {
      let shortCodeData = { id: div.dataset.id, module: div.dataset.module };
      return shortCodeData;
    });

  let payload = { data: {} };
  payload.data.pageId = page.id;
  payload.data.sourceSectionId = source.sourceSectionId;
  payload.data.sourceRowIndex = source.sourceRowIndex;
  payload.data.sourceColumnIndex = source.sourceColumnIndex;
  payload.data.sourceModuleIndex = event.oldIndex;
  payload.data.destinationSectionId = destinationSectionId;
  payload.data.destinationRowIndex = destinationRowIndex;
  payload.data.destinationColumnIndex = destinationColumnIndex;
  payload.data.destinationModuleIndex = event.newIndex + 1;
  payload.data.destinationModules = destinationModules;
  payload.data.isPageUsingTemplate = isPageUsingTemplate;
  payload.data.sourcePageTemplateRegion = sourcePageTemplateRegion;
  payload.data.destinationPageTemplateRegion = destinationPageTemplateRegion;
  payload.data.moduleBeingMovedId = moduleBeingMovedId;

  // debugger;
  return axiosInstance
    .post("/admin/pb-update-module-sort", payload)
    .then(async function (response) {
      console.log(response);
      // fullPageUpdate();
      addGrowl("Module Moved");
      checkIfColumnIsEmpty(sourceColumn);
      return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function checkIfColumnIsEmpty(sourceColumn) {
  console.log("checking if column empty");

  let parent = $(currentModuleDiv).parent()[0];
  //has any divs?
  if ($(parent).find("div").length) {
    $(parent).find(".empty-column").remove();
  }

  if (sourceColumn && !$(sourceColumn).find("div").length) {
    $(sourceColumn).html(
      '<span class="empty-column"><h5>Empty Column</h5><p>(drag element here)</p></span>'
    );
  }

  // let sourceColumnDev = $(`div[data-id="${sourceColumnId}"]`)[0];
  // {
  // }
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
  if (globalService.isBackEnd()) {
    return;
  }

  // $(".pb-wrapper .sidebar-minimizer").click(function () {
  //   Cookies.set("showSidebar", false);
  //   toggleSidebar(false);
  // });

  $(".sidebar-expander").click(function () {
    // debugger;
    let isEditMode = Cookies.get("showSidebar") === "false" ? false : true;
    let showSidebar = !isEditMode;
    Cookies.set("showSidebar", showSidebar);
    toggleSidebar(showSidebar);
  });

  // $(".sidebar-expander.expanded").click(function () {
  //   Cookies.set("showSidebar", false);
  //   toggleSidebar(false);
  // });

  if (isEditMode() === "true") {
    toggleSidebar(true);
  } else {
    toggleSidebar(false);
  }
}

function isEditMode() {
  let isEditMode = Cookies.get("showSidebar");
  return isEditMode;
}

function toggleSidebar(showSidebar) {
  // debugger;
  if (showSidebar) {
    //opening
    $("html").addClass("pb");
    $(".sidebar-expander, .pb-wrapper, html").removeClass("collapsed");
    $(".sidebar-expander, .pb-wrapper, html").addClass("expanded");
  } else {
    //closing
    $("html").removeClass("pb");
    $(".sidebar-expander, .pb-wrapper, html").addClass("collapsed");
    $(".sidebar-expander, .pb-wrapper, html ").removeClass("expanded");

    disableUIHoversAndClicks();
  }
}

async function addUser() {
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
  let s1 = await createInstance(section);

  //add to current page
  if (!page.data.layout) {
    page.data.layout = [];
  }
  page.data.layout.push(s1.id);

  // this.contentService.editPage(this.page);
  let updatedPage = await editInstance(page);

  //update ui
  // this.fullPageUpdate();
  // this.loadSections(updatedPage);
  fullPageUpdate();
}

async function setupAdminMediaFormImage() {
  if (window.location.href.indexOf("admin/content/edit/media/") > 0) {
    let fileName = $('input[name="data[file]"]').val();
    if (fileName) {
      if ($("#fileStorage").val() == "AMAZON_S3") {
        let storageBase = $("#fileStorageBase").val();
        $(".admin-form-media-image").attr("src", `${storageBase}/${fileName}`);
      } else {
        $(".admin-form-media-image").attr("src", `/assets/uploads/${fileName}`);
      }
    }
  }
}

function setupPopovers() {
  var popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

function setupElements() {
  $("#pb-elements").on("click", async function () {
    showElements();
  });
}

function showElements() {
  const elementsList = $("#elements-list").clone();
  $("#pb-content-container").html(elementsList);
  setMainPanelHeaderTextAndIcon("Add Elements", "bi-plus-circle");
  elementsList.removeClass("hide");
  setupSortableModules();
}

async function setupPageForm() {
  $("#page-form").on("click", async function () {
    hideSiteCss();
    console.log("page form click");

    await setPage();
    let data = await dataService.getContentById();
    let form = await dataService.formGet(
      "page",
      page,
      "await submitContent(submission);",
      false,
      undefined,
      sessionID
    );

    $("#pb-content-container").html(form.html);
    loadModuleSettingForm();
  });
}

async function setupSiteCss() {
  $("#site-css").on("click", async function () {
    $("#pb-content-container").empty();
    $(".footer").removeClass("hide");
    $(".css-editor").removeClass("hide");
    setMainPanelHeaderTextAndIcon("Edit Site CSS", "bi-filetype-css");
  });
}

function hideSiteCss() {
  $(".footer").addClass("hide");
  $(".css-editor").addClass("hide");
}

function pageBuilderFormChanged(data) {
  // debugger;

  latestModuleDataFromForm = data.data;

  if (!_.isMatch(latestModuleDataFromForm, originalModuleDataFromDb)) {
    formIsDirty = true;
  } else {
    formIsDirty = false;
  }

  if (formIsDirty) {
    // $('.formio-component-submit').css('background','red');
    if (!$(".submit-alert").length)
      $(
        '<span class="submit-alert alert alert-danger ms-3"><span>Unsaved changes!</span><span id="reset-module" class="btn btn-sm btn-danger">Reset</span></span>'
      ).insertAfter(".formio-component-submit button");
  } else {
    $(".submit-alert").remove();
    if (!data.changed && latestModuleDataFromForm) {
      originalModuleDataFromDb = JSON.parse(
        JSON.stringify(latestModuleDataFromForm)
      ); //deep copy
    }
  }

  if (globalService.isBackEnd()) {
    return;
  }

  if ($.isEmptyObject(latestModuleDataFromForm)) {
    return;
  }

  if (data.changed == undefined && !newDrop) {
    return;
  }

  // if(data.changed){
  //   console.log('form is dirty')
  //   formIsDirty = true;
  // }

  newDrop = false;
  // if (formSubmitted) {
  //   //reset
  //   formSubmitted = false;
  //   return;
  // }

  // if (data.state === "submitted") {
  //   console.log("IGNORING SUBMIT BUTTON CHANGE");
  //   debugger;
  //   return;
  // }

  console.log("pageBuilderFormChanged", latestModuleDataFromForm);
  //render module (may not have instance yet_

  renderSectionOrModule(latestModuleDataFromForm);
}

function clickFormUpdateButton() {
  //now save the new module
  let submitButton = $("#pb-content-container .formio-component-submit .btn");
  submitButton.click();
}

// var returnedFunction = debounce(savePBData(data), 2000);

function renderSectionOrModule(formData) {
  console.log("renderSectionOrModule with form data");
  axiosInstance
    .post(`/api/modules/render`, { data: formData })
    .then(async function (response) {
      console.log("render response", response);

      if (response.data.type === "module") {
        console.log("replacing module", response.data.id);
        if (response.data.id) {
          let moduleDiv = $(`div[data-id="${response.data.id}"]`);
          moduleDiv.replaceWith(response.data.html);
          setCurrentIds(response.data.id);
          // if (!originalModuleDataFromDb.html) {
          //   originalModuleDataFromDb.html = { ...response.data.html };
          // }
        } else {
          $(`.current-drop, div[data-id="unsaved"]`).replaceWith(
            response.data.html
          );
          // clickFormUpdateButton();
        }
      } else if (response.data.type === "section") {
        console.log("replacing section", formData.id);
        $(`section[data-id="${formData.id}"]`).replaceWith(response.data.html);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}
