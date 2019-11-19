var page = {};
var contentType;
var contentTypeComponents;
var axiosInstance;

var imageList, tinyImageList, currentSectionId, currentSection, currentRow, currentRowIndex, currentColumn,
    currentColumnIndex, jsonEditor;

$(document).ready(async function () {
    await setupAxiosInstance();
    setupUIHovers();
    setupUIClicks();
    setupClickEvents();
    // setupWYSIWYG();
    setupJsonEditor();
    await setPage();
    await setContentType();
    imageList = await getImageList();
    // setTimeout(setupPageSettings, 1);
    // setupPageSettings();

    setupFormBuilder(contentType);
    await setupACEEditor();
    await setupDropZone();
});

async function setupAxiosInstance() {

    let baseUrl = window.location.protocol + "//" + window.location.host + "/";
    let token = $('#token').val();

    const defaultOptions = {
        headers: {
            Authorization: `${token}`
        },
        baseUrl: baseUrl
    }

    axiosInstance = axios.create(defaultOptions);
}

async function setPage() {
    let pageId = $('#page-id').val();
    if (pageId) {
        console.log('pageId', pageId);
        axiosInstance.get(`/api/contents/${pageId}`)
            .then(function (response) {
                // handle success
                this.page = response.data;
                console.log('getPage page', page);
            })
    }
}

async function setContentType() {
    let contentTypeId = $('#contentTypeId').val();
    if (contentTypeId) {
        this.contentType = await getContentType(contentTypeId);
    }
}

function axiosTest() {
    console.log('running axios');
    axiosInstance.get('/api/contents')
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
            console.log('done axios');

        });
}

function setupUIHovers() {

    $(".pb-section").on({
        mouseenter: function () {
            let sectionId = getParentSectionId($(this));
            $(`section[id='${sectionId}']`).addClass('section-highlight');
        },
        mouseleave: function () {
            let sectionId = getParentSectionId($(this));
            $(`section[id='${sectionId}']`).removeClass('section-highlight');
        }
    });

    $(".mini-layout .pb-row").on({
        mouseenter: function () {
            let sectionId = getParentSectionId($(this));
            let rowIndex = $(this).index();
            getRow(sectionId, rowIndex).addClass('row-highlight');
        },
        mouseleave: function () {
            let sectionId = getParentSectionId($(this));
            let rowIndex = $(this).index();
            getRow(sectionId, rowIndex).removeClass('row-highlight');
        }
    });

    $(".mini-layout .pb-row .col").on({
        mouseenter: function () {
            let sectionId = getParentSectionId($(this));
            let parentRow = getParentRow(this);
            let rowIndex = $(this).parent().index();
            let colIndex = $(this).index() + 1;
            getColumn(sectionId, rowIndex, colIndex).addClass('col-highlight');
        },
        mouseleave: function () {
            let sectionId = getParentSectionId($(this));
            let parentRow = getParentRow(this);
            let rowIndex = $(this).parent().index();
            let colIndex = $(this).index() + 1;
            getColumn(sectionId, rowIndex, colIndex).removeClass('col-highlight');
        }
    });

}

function setupUIClicks() {

    $(".mini-layout .pb-row").on({
        click: function () {
            currentSectionId = getParentSectionId($(this));
            currentRowIndex = $(this).index();
            console.log('currentRowIndex pbrow', currentRowIndex);
            currentRow = getRow(currentSectionId, currentRowIndex).addClass('row-highlight');
            $('.row-button').show().appendTo(currentRow);
        }
    });

    $(".mini-layout .pb-row .col").on({
        click: function () {
            currentSectionId = getParentSectionId($(this));
            currentRow = getParentRow(this);
            currentRowIndex = $(this).parent().index();
            console.log('currentRowIndex pbcol', currentRowIndex);
            currentColumnIndex = $(this).index() + 1;
            currentColumn = getColumn(currentSectionId, currentRowIndex, currentColumnIndex).addClass('col-highlight');
            $('.col-button').show().appendTo(currentColumn);
        },
    });

    $("section .col").on({
        click: function () {
            $('.col-highlight').removeClass('col-highlight');
            $('.block-edit').removeClass('block-edit');
            currentSectionId = $(this).closest('section').data('id');
            currentRow = $(this).closest('.row')[0];
            $(this).closest('.row').addClass('row-highlight');
            currentRowIndex = $(this).closest('.row').index();
            console.log('currentRowIndex pbcol', currentRowIndex);
            currentColumnIndex = $(this).index() + 1;
            currentColumn = $(this);
            currentColumn.addClass('col-highlight');
            $('.col-button').show().appendTo(currentColumn);
            $('.row-button').show().appendTo(currentRow);
            $('.block-button').show().appendTo(currentColumn.children('span'));
            currentColumn.children('span').addClass('block-edit');
        },
    });

}

function getParentSectionId(el) {
    return $(el).closest('.pb-section').data('id');
}

function getRow(sectionId, rowIndex) {
    return $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`);
}

function getParentRow(el) {
    return $(el).closest('.row');
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
    $('.section-background-editor button').on("click", async function () {
        let backgroundSetting = $(this).data('type');
        currentSectionId = $(this).data('section-id');
        setupColorPicker(currentSectionId);

        currentSectionRecord = await getCurrentSection();
        currentSectionRecord.data.background = { "type": backgroundSetting };
        // setDefaultBackgroundSetting(currentSectionRecord);
        showBackgroundTypeOptions(backgroundSetting, currentSectionId);

        editContentInstance(currentSectionRecord);
    });
}

async function setDefaultBackgroundSetting(currentSectionRecord, color) {
    currentSectionRecord.data.background.color = color;
}

async function showBackgroundTypeOptions(backgroundSetting, sectionId) {
    $('[id^=background-]').hide();
    let selector = `[id='background-${backgroundSetting}'],[data-id='${sectionId}']`;
    $(selector).show();
}

async function setupColorPicker(currentSectionId) {

    const pickr = Pickr.create({
        el: `#backgroundColorPreview-${currentSectionId}`,
        theme: 'nano', // or 'monolith', or 'nano'

        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 0.95)',
            'rgba(156, 39, 176, 0.9)',
            'rgba(103, 58, 183, 0.85)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(33, 150, 243, 0.75)',
            'rgba(3, 169, 244, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(139, 195, 74, 0.85)',
            'rgba(205, 220, 57, 0.9)',
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)'
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
                save: true
            }
        }
    });

    pickr.on('change', (color, instance) => {
        // debugger;
        console.log('change', color, instance);
        $(`section[data-id="${currentSectionId}"]`).css('background-color', color.toHEXA());
    }).on('save', (color, instance) => {
        console.log('save', color, instance);
    });


    var parent = document.querySelector(`#backgroundColorPreview-${currentSectionId}`);
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
    console.log('adding section');
    let row = await generateNewRow();
    //rows
    let rows = [row];

    //section
    let nextSectionCount = 1;
    if (page.data.layout) {
        nextSectionCount = page.data.layout.length + 1;
    }

    let section = { title: `Section ${nextSectionCount}`, contentType: 'section', rows: rows };
    let s1 = await createContentInstance(section);

    //add to current page
    if (!page.data.layout) {
        page.data.layout = []
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
    console.log('currentSection', currentSection);
    // $('#section-editor').text(JSON.stringify(currentSection));
    loadJsonEditor();
    $('#sectoinEditorModal').appendTo("body").modal('show');
}

async function deleteSection(sectionId, index) {
    console.log('delete section', sectionId, index);
    //delete from page
    page.data.layout.splice(index, 1);
    await editContentInstance(page);

    //delete section
    await deleteContentInstance(sectionId);
    fullPageUpdate();

}

async function saveSection() {
    var sectionData = jsonEditor.get();
    console.log('jsonEditor', sectionData);
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

    let row = { class: 'row', columns: [col] }

    return row;
}

async function generateNewColumn() {
    let block1 = { contentType: 'block', body: '<p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>' };

    //save blocks and get the ids
    let b1 = await createContentInstance(block1);
    let b1ShortCode = `[BLOCK id="${b1.id}"/]`;

    //columns
    let col = { class: 'col', content: `${b1ShortCode}` }
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
    debugger;
    let section = await getContentInstance(currentSectionId);
    console.log('secton', section);
    console.log('currentRowIndex', currentRowIndex);

    let column = await generateNewColumn();
    section.data.rows[currentRowIndex].columns.push(column);
    console.log('columns', section.data.rows[currentRowIndex].columns);
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

async function editColumnContent() {

    console.log(currentSectionId);
    // fullPageUpdate();

}

async function deleteBlock() {
    let section = await getContentInstance(currentSectionId);
    section.data.rows[currentRowIndex].columns.splice(currentColumnIndex - 1, 1);

    //TODO, delete block too

    editContentInstance(section);

    fullPageUpdate();
}

async function getContentInstance(id) {
    return axiosInstance.get(`/api/contents/${id}`)
        .then(async function (response) {
            console.log(response);
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
    return axiosInstance.get(url)
        .then(async function (record) {
            if (record.data[0]) {
                return record.data[0];
            }
            return 'not found';
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function getContentByContentTypeAndTitle(contentType, title) {
    const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
    const encodedFilter = encodeURI(filter);
    let url = `/api/contents?filter=${encodedFilter}`;
    return axiosInstance.get(url)
        .then(async function (record) {
            if (record.data[0]) {
                return record.data[0];
            }
            return 'not found';
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
    console.log('payload', payload);
    if (payload.id || 'id' in payload) {
        delete payload.id;
    }

    if (!payload.data) {
        let temp = { data: payload };
        payload = temp;
    }

    // return this.http.post("/api/contents/", content).toPromise();
    return axiosInstance.post('/api/contents/', payload)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });

}

async function editContentInstance(payload) {
    let id = payload.id;
    console.log('putting payload', payload);
    if (payload.id) {
        delete payload.id;
    }
    if (payload.data.id) {
        delete payload.data.id;
    }
    // let data = {};
    // if(payload.data){
    //     data = payload.data;
    // }else{
    //     data = payload;
    // }
    // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
    console.log(axiosInstance);
    return axiosInstance.put(`/api/contents/${id}`, payload)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function editContentType(payload) {
    // debugger;
    let id = payload.id;
    console.log('putting payload', payload);
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
    return axiosInstance.put(`/api/contentTypes/${id}`, payload)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function deleteContentInstance(id) {
    console.log('deleting content', id);
    // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
    return axiosInstance.delete(`/api/contents/${id}`)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function deleteContentType(id) {
    console.log('deleting content', id);
    // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
    axiosInstance.delete(`/api/contentTypes/${id}`)
        .then(async function (response) {
            console.log(response);
            redirect('/admin/content-types')
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
    $('#pageSettingsModal').appendTo("body").modal('show');
}

async function setupPageSettings(action, contentType) {
    console.log('setupPageSettings');
    let pageId = $('#page-id').val();
    // let page = await getContentInstance(pageId);

    // Formio.createForm(document.getElementById('formio'), {
        let components=  [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name.',
            input: true
          },
          {
            type: 'textfield',
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            input: true
          },
          {
            type: 'button',
            action: 'submit',
            label: 'Submit',
            theme: 'primary'
          }
        ];

    // debugger;
    if (!this.page.data) {
        // debugger;
        console.log('no data');
        alert('no data');

        while (!this.page.data) {
            //wait till there is data
            console.log('now data is ready');
        }
    }

    console.log('this.page.data==>', this.page.data);

    let formValuesToLoad = {};
    let componentsToLoad = components;
    // debugger;
    if (action == 'edit' && contentType == 'current') {
        formValuesToLoad = this.page.data;
    }

    if (action == 'add') {
        // components.find(({ key }) => key === 'id' ).remove();
        componentsToLoad = components.filter(e => e.key !== 'id')
    }

    let formio = Formio.createForm(document.getElementById('formio'), {
        components: componentsToLoad
    }).then(async function (form) {
        form.submission = {
            data: formValuesToLoad
        };
        form.on('submit', async function (submission) {
            console.log('submission ->', submission);
            //TODO: copy logic from admin app to save data
            // let entity = {id: submission.data.id, url: submission.data.url, data: submission.data}
            if (action == 'add') {
                // debugger;
                //need create default block, etc
                submission.data.contentType = contentType;
                await createContentInstance(submission.data);
                await postProcessNewContent(submission.data);
                await redirect(submission.data.url);
            }
            else {
                //editing current
                // debugger;
                let entity = processContentFields(submission.data)
                await editContentInstance(entity);
                fullPageUpdate();
            }

            // debugger;


            // for(var name in submission.data) {
            //     var value = submission.data[name];
            //     page.data[name] = value;
            // }
        });
        form.on('error', (errors) => {
            console.log('We have errors!');
        })
    });

    console.log('page settings loaded')
}

async function setupFormBuilder(contentType) {

    // debugger;
    // (change)="onFormioChange($event)"
    let formDiv = $('#formBuilder');
    if (!formDiv.length) {
        return;
    }

    Formio.builder(document.getElementById('formBuilder'), null)
        .then(async function (form) {
            form.setForm({
                components: contentType.components
            });
            form.on('submit', async function (submission) {
                //             debugger;
                console.log('submission ->', submission);
            });
            form.on('change', async function (event) {
                // debugger;
                if (event.components) {
                    contentTypeComponents = event.components;
                    console.log('event ->', event);
                }
            });
        });

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
    // debugger;
    console.log('contentTypeComponents', contentTypeComponents);
    contentType.components = contentTypeComponents;
    await editContentType(contentType);
}

async function openNewContentTypeModal() {
    $('#newContentTypeModal').appendTo("body").modal('show');
}

async function openWYSIWYG() {
    console.log('WYSIWYG setup');
    // $('section span').on("click", async function () {
    var id = $('.block-edit').data('id');
    console.log('span clicked ' + id);
    $('#block-edit-it').val(id);
    $('#wysiwygModal').appendTo("body").modal('show');

    var content = await getContentInstance(id);

    $('textarea.wysiwyg-content').html(content.data.body);

    // $(document).off('focusin.modal');
    //allow user to interact with tinymcs dialogs: https://stackoverflow.com/questions/36279941/using-tinymce-in-a-modal-dialog
    $(document).on('focusin', function (e) {
        if ($(e.target).closest(".tox-dialog").length) {
            e.stopImmediatePropagation();
        }
    });

    tinymce.remove(); //remove previous editor
    // tinymce.baseURL = '/tinymce/';
    // console.log('tinymce.base_url',tinymce.baseURL);
    //plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount tinymcespellchecker a11ychecker imagetools textpattern help formatpainter permanentpen pageembed tinycomments mentions linkchecker',

    $('textarea.wysiwyg-content').tinymce({
        selector: '#block-content',
        height: 600,
        plugins: 'image imagetools code',
        toolbar: 'code | formatselect | bold italic strikethrough forecolor backcolor permanentpen formatpainter | link image media pageembed | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | addcomment',
        image_advtab: false,
        image_list: tinyImageList,
        automatic_uploads: true,
        images_upload_handler: function (blobInfo, success, failure) {
            var xhr, formData;

            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', "/api/containers/container1/upload");

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
            formData.append('file', blobInfo.blob(), blobInfo.filename());

            xhr.send(formData);
        }
    });
    // });
}

function setupJsonEditor() {
    var container = document.getElementById("jsoneditor");
    if (!container) return;

    var options = {
        mode: 'text',
        modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
        onError: function (err) {
            alert(err.toString());
        },
        onModeChange: function (newMode, oldMode) {
            console.log('Mode switched from', oldMode, 'to', newMode);
        }
    };

    jsonEditor = new JSONEditor(container, options);
    // editor.destroy(); //reset'


}

function loadJsonEditor() {
    var json = currentSectionRecord;
    jsonEditor.set(json);

    // get json
    var editor = jsonEditor.get();
}

async function getImageList() {
    let imageList = await axiosInstance.get(`/api/containers/container1/files`);
    // console.log('imageList', imageList.data);


    tinyImageList = [];

    imageList.data.forEach(image => {
        let imageItem = { title: image.name, value: `/api/containers/${image.container}/download/${image.name}` };
        tinyImageList.push(imageItem);
    });
}

async function saveWYSIWYG() {
    let id = $('.block-edit').data('id');
    console.log('saving ' + id);

    let content = $('textarea.wysiwyg-content').html();

    //update db
    let block = await getContentInstance(id);
    block.data.body = content;
    editContentInstance(block);

    //update screen
    $('.block-edit').children().first().html(content);
    // $(`span[data-id="${id}"]`).html(content);

    //re-add block edit
    $('.block-button').show().appendTo($('.block-edit'));

    fullPageUpdate();

}

async function addModule(systemid) {
    console.log('adding ' + systemid);
    $('#moduleSettingsModal').appendTo("body").modal('show');

}

async function postProcessNewContent(content) {
    // debugger;
    if (content.contentType == 'page') {
        if (content.includeInMenu) {
            //add to existing main menu
            // await editContentInstance(entity);
            let mainMenu = await getContentByContentTypeAndTitle('menu', 'Main')
            let meniItem = {
                url: content.url,
                title: content.name,
                active: true,
                level: "0"
            }
            mainMenu.data.links.push(meniItem);
            await editContentInstance(mainMenu);
        }
    }
}


//TODO, make this just refresh the body content with a full get
function fullPageUpdate() {
    console.log('refreshing page');
    location.reload();
}

async function redirect(url) {
    // debugger;
    console.log('redirecting page');
    // window.location.href = url;
    window.location.replace(url);
    return false;
}

async function writeFile(container, file) {
    let formData = new FormData();
    formData.append('file', file);

    axiosInstance.post(`/api/containers/${container}/upload`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    ).then(function () {
        console.log('SUCCESS!!');
    })
        .catch(function () {
            console.log('FAILURE!!');
        });

}

async function setupACEEditor() {
    if ($('#editor').length === 0) {
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

    editor.getSession().on('change', function () {
        update()

        // var beautify = ace.require("ace/ext/beautify"); // get reference to extension
        // var editor = ace.edit("editor"); // get reference to editor
        // beautify.beautify(editor.session);    
    });

    function update() //writes in <div> with id=output
    {
        var val = editor.getSession().getValue();
        // console.log(val);
        $('#templateCss').html(val);
    }

    $('#save-global-css').click(function () {
        let cssContent = editor.getSession().getValue();
        let file = new File([cssContent], "template.css", { type: "text/css" })
        writeFile('css', file)
    });

    beatifyACECss();
}

async function setupDropZone() {

    Dropzone.autoDiscover = false;

    var myDropzone = $("#sonicjs-dropzone").dropzone(
        {
            url: "/api/containers/files/upload",
            addRemoveLinks: true,
            maxFilesize: 5,
            dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Drop files <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (Or Click)</h4></span>',
            dictResponseError: 'Error uploading file!',
            headers: {
                'Authorization': $('#token').val()
            },
            accept: async function (file, done) {
                let title = file.name.replace(/\.[^/.]+$/, "")
                let payload = {
                    data: {
                        title: title,
                        file: file.name,
                        contentType: 'media'
                    }
                }
                await createContentInstance(payload);
                done();
            }
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
    var beautify = ace.require("ace/ext/beautify"); // get reference to extension
    var editor = ace.edit("editor"); // get reference to editor
    beautify.beautify(editor.session);
}



