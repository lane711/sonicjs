$(document).ready(async function () {

  $(function () {
    $('[data-toggle="popover"]').popover()
  })

  $('table').on('shown.bs.popover', function () {
    var btns = document.getElementsByClassName("btn-danger");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = async function (event) {
        event.preventDefault();
        //delete content
        var contentIdToDelete = this.href.substring(this.href.lastIndexOf('/') + 1);
        if (contentIdToDelete) {
          await deleteContentInstance(contentIdToDelete);
          location.reload();
        }

      };
    }

  });

});