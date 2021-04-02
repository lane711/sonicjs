$(document).ready(async function () {
  $(function () {
    $('[data-toggle="popover"]').popover();
  });

  $("table").on("shown.bs.popover", function () {
    // debugger;
    var btns = document.getElementsByClassName("custom-delete");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = async function (event) {
        event.preventDefault();
        //delete content
        if (!this.href) return;
        var typeToDelete = getPathParts(this.href, 1);
        var idToDelete = getPathParts(this.href, 0);
        if (idToDelete) {
          // debugger;
          if (typeToDelete == "content") {
            await deleteContentInstance(idToDelete);
            location.reload();
          }

          if (typeToDelete == "contentType") {
            await dataService.contentTypeDelete(idToDelete);
            location.reload();
          }

          if (typeToDelete == "user") {
            await deleteUser(idToDelete);
            location.reload();
          }

          if (typeToDelete == "Role") {
            await deleteContentInstance(idToDelete);
            location.reload();
          }

          if (typeToDelete == "module") {
            await dataService.deleteModule(idToDelete);
            location.reload();
          }
        }
      };
    }
  });

  function getPathParts(path, positionFromLast) {
    var parts = path.split("/");
    return parts[parts.length - (positionFromLast + 1)];
  }

  $("#admin-content").DataTable({
    order: [[2, "desc"]],
  });
});

function wait(ms) {
  var d = new Date();
  var d2 = null;
  do {
    d2 = new Date();
  } while (d2 - d < ms);
}

