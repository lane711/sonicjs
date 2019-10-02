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
        debugger;
        if(!this.href) return;

        var typeToDelete = getPathParts(this.href, 1);
        var idToDelete = getPathParts(this.href, 0);
        if (idToDelete) {
          if (typeToDelete == "content") {
            await deleteContentInstance(idToDelete);
            location.reload();
          }

          if (typeToDelete == "contentType") {
            await deleteContentType(idToDelete);
            location.reload();
          }

        }

      };
    }

  });

  function getPathParts(path, positionFromLast){
    var parts = path.split('/');
    return parts[parts.length - (positionFromLast + 1)];
  }

});