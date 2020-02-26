$(document).ready(async function () {



  var CLIPBOARD = null;

  $(function() {
    $("#tree")
      .fancytree({
        checkbox: true,
        checkboxAutoHide: true,
        titlesTabbable: true, // Add all node titles to TAB chain
        quicksearch: true, // Jump to nodes when pressing first character
        // source: SOURCE,
        source: { url: "https://cdn.rawgit.com/mar10/fancytree/72e03685/demo/ajax-tree-products.json" },

        extensions: ["edit", "dnd5", "table", "gridnav"],

        dnd5: {
          preventVoidMoves: true,
          preventRecursion: true,
          autoExpandMS: 400,
          dragStart: function(node, data) {
            return true;
          },
          dragEnter: function(node, data) {
            // return ["before", "after"];
            return true;
          },
          dragDrop: function(node, data) {
            data.otherNode.moveTo(node, data.hitMode);
          },
        },
        edit: {
          triggerStart: ["f2", "shift+click", "mac+enter"],
          close: function(event, data) {
            if (data.save && data.isNew) {
              // Quick-enter: add new nodes until we hit [enter] on an empty title
              $("#tree").trigger("nodeCommand", {
                cmd: "addSibling",
              });
            }
          },
        },
        table: {
          indentation: 20,
          nodeColumnIdx: 2,
          checkboxColumnIdx: 0,
        },
        gridnav: {
          autofocusInput: false,
          handleCursorKeys: true,
        },

        lazyLoad: function(event, data) {
          data.result = { url: "../demo/ajax-sub2.json" };
        },
        createNode: function(event, data) {
          var node = data.node,
            $tdList = $(node.tr).find(">td");

          // Span the remaining columns if it's a folder.
          // We can do this in createNode instead of renderColumns, because
          // the `isFolder` status is unlikely to change later
          if (node.isFolder()) {
            $tdList
              .eq(2)
              .prop("colspan", 6)
              .nextAll()
              .remove();
          }
        },
        renderColumns: function(event, data) {
          var node = data.node,
            $tdList = $(node.tr).find(">td");

          // (Index #0 is rendered by fancytree by adding the checkbox)
          // Set column #1 info from node data:
          $tdList.eq(1).text(node.getIndexHier());
          // (Index #2 is rendered by fancytree)
          // Set column #3 info from node data:
          $tdList
            .eq(3)
            .find("input")
            .val(node.key);
          $tdList
            .eq(4)
            .find("input")
            .val(node.data.foo);

          // Static markup (more efficiently defined as html row template):
          // $tdList.eq(3).html("<input type='input' value='"  "" + "'>");
          // ...
        },
        modifyChild: function(event, data) {
          data.tree.info(event.type, data);
        },
      })
      .on("nodeCommand", function(event, data) {
        // Custom event handler that is triggered by keydown-handler and
        // context menu:
        var refNode,
          moveMode,
          tree = $.ui.fancytree.getTree(this),
          node = tree.getActiveNode();

        switch (data.cmd) {
          case "addChild":
          case "addSibling":
          case "indent":
          case "moveDown":
          case "moveUp":
          case "outdent":
          case "remove":
          case "rename":
            tree.applyCommand(data.cmd, node);
            break;
          case "cut":
            CLIPBOARD = { mode: data.cmd, data: node };
            break;
          case "copy":
            CLIPBOARD = {
              mode: data.cmd,
              data: node.toDict(function(n) {
                delete n.key;
              }),
            };
            break;
          case "clear":
            CLIPBOARD = null;
            break;
          case "paste":
            if (CLIPBOARD.mode === "cut") {
              // refNode = node.getPrevSibling();
              CLIPBOARD.data.moveTo(node, "child");
              CLIPBOARD.data.setActive();
            } else if (CLIPBOARD.mode === "copy") {
              node.addChildren(
                CLIPBOARD.data
              ).setActive();
            }
            break;
          default:
            alert("Unhandled command: " + data.cmd);
            return;
        }
      })
      .on("keydown", function(e) {
        var cmd = null;

        // console.log(e.type, $.ui.fancytree.eventToString(e));
        switch ($.ui.fancytree.eventToString(e)) {
          case "ctrl+shift+n":
          case "meta+shift+n": // mac: cmd+shift+n
            cmd = "addChild";
            break;
          case "ctrl+c":
          case "meta+c": // mac
            cmd = "copy";
            break;
          case "ctrl+v":
          case "meta+v": // mac
            cmd = "paste";
            break;
          case "ctrl+x":
          case "meta+x": // mac
            cmd = "cut";
            break;
          case "ctrl+n":
          case "meta+n": // mac
            cmd = "addSibling";
            break;
          case "del":
          case "meta+backspace": // mac
            cmd = "remove";
            break;
          // case "f2":  // already triggered by ext-edit pluging
          //   cmd = "rename";
          //   break;
          case "ctrl+up":
          case "ctrl+shift+up": // mac
            cmd = "moveUp";
            break;
          case "ctrl+down":
          case "ctrl+shift+down": // mac
            cmd = "moveDown";
            break;
          case "ctrl+right":
          case "ctrl+shift+right": // mac
            cmd = "indent";
            break;
          case "ctrl+left":
          case "ctrl+shift+left": // mac
            cmd = "outdent";
        }
        if (cmd) {
          $(this).trigger("nodeCommand", { cmd: cmd });
          return false;
        }
      });

    /*
     * Tooltips
     */
    // $("#tree").tooltip({
    //   content: function () {
    //     return $(this).attr("title");
    //   }
    // });

    /*
     * Context menu (https://github.com/mar10/jquery-ui-contextmenu)
     */
    $("#tree").contextmenu({
      delegate: "span.fancytree-node",
      menu: [
        {
          title: "Edit <kbd>[F2]</kbd>",
          cmd: "rename",
          uiIcon: "ui-icon-pencil",
        },
        {
          title: "Delete <kbd>[Del]</kbd>",
          cmd: "remove",
          uiIcon: "ui-icon-trash",
        },
        { title: "----" },
        {
          title: "New sibling <kbd>[Ctrl+N]</kbd>",
          cmd: "addSibling",
          uiIcon: "ui-icon-plus",
        },
        {
          title: "New child <kbd>[Ctrl+Shift+N]</kbd>",
          cmd: "addChild",
          uiIcon: "ui-icon-arrowreturn-1-e",
        },
        { title: "----" },
        {
          title: "Cut <kbd>Ctrl+X</kbd>",
          cmd: "cut",
          uiIcon: "ui-icon-scissors",
        },
        {
          title: "Copy <kbd>Ctrl-C</kbd>",
          cmd: "copy",
          uiIcon: "ui-icon-copy",
        },
        {
          title: "Paste as child<kbd>Ctrl+V</kbd>",
          cmd: "paste",
          uiIcon: "ui-icon-clipboard",
          disabled: true,
        },
      ],
      beforeOpen: function(event, ui) {
        var node = $.ui.fancytree.getNode(ui.target);
        $("#tree").contextmenu(
          "enableEntry",
          "paste",
          !!CLIPBOARD
        );
        node.setActive();
      },
      select: function(event, ui) {
        var that = this;
        // delay the event, so the menu can close and the click event does
        // not interfere with the edit control
        setTimeout(function() {
          $(that).trigger("nodeCommand", { cmd: ui.cmd });
        }, 100);
      },
    });
  });



});



