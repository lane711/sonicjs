// import axios from 'axios';

$(document).ready(function () {
    setupUIHovers();
    setupClickEvents();
axiosTest();
    // SetupWYSIWYG();
});

function axiosTest(){
    console.log('running axios');
    axios.get('/user?ID=12345')
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

function setupUIHovers(){
    console.log('hover setup');

    $(".pb-section").on({
        mouseenter: function () {
          let sectionId = $(this).data('id');
          $(`section[id='${sectionId}']`).addClass('section-highlight');
        },
        mouseleave: function () {
          let sectionId = $(this).data('id');
          $(`section[id='${sectionId}']`).removeClass('section-highlight');
        }
      });

      $(".mini-layout .pb-row").on({
        mouseenter: function () {
          let sectionId = $(this).closest('.pb-section').data('id');
          let rowIndex = $(this).index();
          $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`).addClass('row-highlight');
        },
        mouseleave: function () {
          let sectionId = $(this).closest('.pb-section').data('id');
          let rowIndex = $(this).index();
          $(`section[id='${sectionId}'] .row:nth-child(${rowIndex})`).removeClass('row-highlight');
        }
      });

}

function setupClickEvents(){
    //add section
    $('.add-section').on("click", function () {
        addSection();
      });
}

function setupWYSIWYG(){
    console.log('WYSIWYG setup');
    tinymce.remove(); //remove previous editor
    // tinymce.baseURL = '/tinymce/';
    // console.log('tinymce.base_url',tinymce.baseURL);
    //plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount tinymcespellchecker a11ychecker imagetools textpattern help formatpainter permanentpen pageembed tinycomments mentions linkchecker',

    $('textarea.wysiwyg-content').tinymce({
      selector: '#block-content',
      height: 600,
      plugins: 'image imagetools',
      toolbar: 'formatselect | bold italic strikethrough forecolor backcolor permanentpen formatpainter | link image media pageembed | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | addcomment',
      image_advtab: false,
      image_list: [
        {title: 'My image 1', value: 'https://www.tinymce.com/my1.gif'},
        {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
      ],
      // images_upload_url: 'http://localhost:3000/api/containers/container1/upload',
      automatic_uploads: true,
      images_upload_handler: function (blobInfo, success, failure) {
        var xhr, formData;

        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', "http://localhost:3000/api/containers/container1/upload");

        xhr.onload = function() {
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
}

function addSection() {
  
    console.log('adding section');
    return;
    // let row = await this.generateNewRow();
    // //rows
    // let rows = [row];

    // //section
    // let nextSectionCount = 1;
    // if (this.page.data.layout) {
    //   nextSectionCount = this.page.data.layout.length + 1;
    // }

    // let section = { title: `Section ${nextSectionCount}`, contentType: 'section', rows: rows };
    // let s1: any = await this.contentService.createContentInstance(section);

    // //add to current page
    // if (!this.page.data.layout) {
    //   this.page.data.layout = []
    // }
    // this.page.data.layout.push(s1.id);

    // // this.contentService.editPage(this.page);
    // let updatedPage = await this.contentService.editContentInstance(this.page);


    // //update ui
    // // this.fullPageUpdate();
    // // this.loadSections(updatedPage);
    // this.refreshPage(updatedPage);
  }