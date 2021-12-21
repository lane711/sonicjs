$(document).ready(async function () {
  $(function () {
    // $('[data-toggle="popover"]').popover();
    // $('[data-toggle="popover"]').on('click', function(){
    //   $('[data-toggle="popover"]').popover();
    // });

    $(document).on('click', '[data-toggle="popover"]', function (e) {
      //
      // If popover is visible: do nothing
      //
      if ($(this).prop('popShown') == undefined) {
         $(this).prop('popShown', true).popover('show');
      }
  });
  
  });

  $("table").on("shown.bs.popover", function () {
    var btns = document.getElementsByClassName("custom-delete");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = async function (event) {
        event.preventDefault();
        //delete content
        if (!this.href) return;
        var typeToDelete = getPathParts(this.href, 2);
        var idToDelete = getPathParts(this.href, 1);
        var sessionID = getPathParts(this.href, 0);

        if (idToDelete) {
          if (typeToDelete == "content") {
            await deleteContentInstance(idToDelete, sessionID);
            location.reload();
          }

          if (typeToDelete == "contentType") {
            await dataService.contentTypeDelete(idToDelete, sessionID);
            location.reload();
          }

          if (typeToDelete == "user") {
            await userDelete(idToDelete, sessionID);
            location.reload();
          }

          if (typeToDelete == "Role") {
            await deleteContentInstance(idToDelete, sessionID);
            location.reload();
          }

          if (typeToDelete == "module") {
            await dataService.deleteModule(idToDelete, sessionID);
            location.reload();
          }

          if (typeToDelete == "media") {
            await dataService.deleteModule(idToDelete, sessionID);
            location.reload();
          }
        }
      };
    }
  });

  $(".admin-media-list .btn-media-delete").on("shown.bs.popover", function () {
    // debugger;
    var btns = document.getElementsByClassName("custom-delete");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = async function (event) {
        event.preventDefault();
        //delete content
        if (!this.href) return;
        var typeToDelete = getPathParts(this.href, 2);
        var idToDelete = getPathParts(this.href, 1);
        var sessionID = getPathParts(this.href, 0);

        if (idToDelete) {

          if (typeToDelete == "media") {
            await dataService.mediaDelete(idToDelete, sessionID);
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

