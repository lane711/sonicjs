
$(document).ready(function () {

  var quill = new Quill('#editor-container', {
    modules: {
      toolbar: [
        ['bold', 'italic'],
        ['link', 'blockquote', 'code-block', 'image'],
        [{ list: 'ordered' }, { list: 'bullet' }]
      ]
    },
    placeholder: 'Compose an epic...',
    theme: 'snow'
  });

  $('#wysiwygModalTrigger').on("click", function () {
    $('#wysiwygModal').appendTo("body").modal('show');
    $('.ql-editor').text('load me here');
    console.log('quill', quill);
  });

  $('.wysiwyg-save').on("click", function () {
    console.log('saveing wysiwyg');
    console.log(quill.getContents())
  });


});


