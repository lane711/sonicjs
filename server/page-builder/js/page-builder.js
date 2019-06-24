var page = {};
var imageList, tinyImageList, currentSectionId, currentRow, currentRowIndex, currentColumn, currentColumnIndex;

$(document).ready(async function () {
    setupUIHovers();
    setupUIClicks();
    setupClickEvents();
    // setupWYSIWYG();
    getPage();
    imageList = await getImageList();
});

async function getPage() {
    let pageId = $('#page-id').val();
    console.log('pageId', pageId);
    axios.get(`/api/contents/${pageId}`)
        .then(function (response) {
            // handle success
            page = response.data;
            console.log('getPage page', page);
        })
}

function axiosTest() {
    console.log('running axios');
    axios.get('/api/contents')
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

function getParentSectionId(el){
    return $(el).closest('.pb-section').data('id');
}

function getRow(sectionId, rowIndex){
    return $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`);
}

function getParentRow(el){
    return $(el).closest('.row');
}

function getColumn(sectionId, rowIndex, colIndex){
    return getRow(sectionId, rowIndex).find(`.col:nth-child(${colIndex})`);
}

async function setupClickEvents() {
    //add section
    // $('.add-section').on("click", async function () {
    //     await addSection();
    // });
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

async function addRow(sectionId) {
    console.log('adding row to section: ' + sectionId);
    let row = await this.generateNewRow();

    let section = await getContentInstance(sectionId);
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
    let section = await getContentInstance(currentSectionId);
    console.log('secton', section);
    console.log('currentRowIndex', currentRowIndex);

    let column = await generateNewColumn();
    section.data.rows[currentRowIndex].columns.push(column);
    console.log('columns', section.data.rows[currentRowIndex -1].columns);
    editContentInstance(section);

    fullPageUpdate();
}

async function deleteColumn() {
    let section = await getContentInstance(currentSectionId);
    section.data.rows[currentRowIndex].columns.splice(currentColumnIndex -1,1);

    //TODO, delete block too

    editContentInstance(section);

    fullPageUpdate();
}

async function deleteBlock() {
    let section = await getContentInstance(currentSectionId);
    section.data.rows[currentRowIndex].columns.splice(currentColumnIndex -1,1);
    
    //TODO, delete block too

    editContentInstance(section);

    fullPageUpdate();
}

createContentInstance2 = async () => {
    let res = await axios.get("https://reqres.in/api/users?page=1");
    let { data } = await res.data;
    this.setState({ users: data });
};

async function getContentInstance(id) {
    return axios.get(`/api/contents/${id}`)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function createContentInstance(payload) {
    console.log('createContentInstance payload', payload);
    let content = {};
    content.data = {};
    this.processContentFields(payload, content);
    console.log('content', content);
    // return this.http.post("/api/contents/", content).toPromise();
    return axios.post('/api/contents/', content)
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
    // return this.http.put(environment.apiUrl + `contents/${id}`, payload).toPromise();
    return axios.put(`/api/contents/${id}`, payload)
        .then(async function (response) {
            console.log(response);
            return await response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

function processContentFields(payload, content) {
    for (var property in payload) {
        if (payload.hasOwnProperty(property)) {
            if (property == 'url' || property == 'id') {
                content.url = payload.url;
                continue;
            }
            content.data[property] = payload[property];
        }
    }
}


async function openWYSIWYG() {
    console.log('WYSIWYG setup');

    // $('section span').on("click", async function () {
        var id = $('.block-edit').data('id');
        console.log('span clicked ' + id);
        $('#block-edit-it').val(id);
        $('#wysiwygModal').appendTo("body").modal('show');

        var content = $('.block-edit p').prop('outerHTML');
        $('textarea.wysiwyg-content').html(content);

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
            // images_upload_url: 'http://localhost:3000/api/containers/container1/upload',
            automatic_uploads: true,
            images_upload_handler: function (blobInfo, success, failure) {
                var xhr, formData;

                xhr = new XMLHttpRequest();
                xhr.withCredentials = false;
                xhr.open('POST', "http://localhost:3000/api/containers/container1/upload");

                xhr.onload = function () {
                    var json;

                    if (xhr.status != 200) {
                        failure("HTTP Error: " + xhr.status);
                        return;
                    }

                    json = JSON.parse(xhr.responseText);
                    var file = json.result.files.file[0];
                    var location = `http://localhost:3000/api/containers/${file.container}/download/${file.name}`;
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

async function getImageList() {
    let imageList = await axios.get(`/api/containers/container1/files`);
    // console.log('imageList', imageList.data);


    tinyImageList = [];

    imageList.data.forEach(image => {
        let imageItem = { title: image.name, value: `http://localhost:3000/api/containers/${image.container}/download/${image.name}` };
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
}

//TODO, make this just refresh the body content with a full get
function fullPageUpdate() {
    console.log('refreshing page');
    location.reload();
}