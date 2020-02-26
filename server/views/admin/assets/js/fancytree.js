$(document).ready(async function () {


  $("#tree").fancytree({
    extensions: ["dnd5"],
    treeId: "2",
    source: {
      url: "https://cdn.rawgit.com/mar10/fancytree/72e03685/demo/ajax-tree-products.json",
    },
    init: function(event, data) {
      data.tree.getFirstChild().setTitle("D:\\");
    },
    dnd5: {
      // --- Drag-support:
      dragStart: function(node, data) {
        node.debug( "T2: dragStart: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
          ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data );

          data.effectAllowed = "all";
          data.dropEffect = data.dropEffectSuggested;
          return true;
      },
      // dragEnd: function(node, data) {
      //   node.warn( "T2: dragEnd: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
      //     ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data );
      //     alert("T2: dragEnd")
      // },
      // --- Drop-support:
      dragEnter: function(node, data) {
        node.debug( "T2: dragEnter: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
          ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data );
        return true;
      },
      dragOver: function(node, data) {
        logLazy("dragOver", null, 2000,
          "T2: dragOver: " + "data: " + data.dropEffect + "/" + data.effectAllowed +
          ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed);

          data.dropEffect = data.dropEffectSuggested;
      },
      dragDrop: function(node, data) {
        var newNode,
          transfer = data.dataTransfer,
          sourceNodes = data.otherNodeList,
          mode = data.dropEffect;

        // don't open links, files, ... even if an error occurs in this handler:
        data.originalEvent.preventDefault();

        node.debug( "T2: dragDrop: effect=" + "data: " + data.dropEffect + "/" + data.effectAllowed +
          ", dataTransfer: " + data.dataTransfer.dropEffect + "/" + data.dataTransfer.effectAllowed, data );

        if( data.hitMode === "after" ){
          // If node are inserted directly after tagrget node one-by-one,
          // this would reverse them. So we compensate:
          sourceNodes.reverse();
        }
        if (data.otherNode) {
          // Drop another Fancytree node from same frame
          // (maybe from another tree however)
          var sameTree = data.otherNode.tree === data.tree;

          if (mode === "move") {
            data.otherNode.moveTo(node, data.hitMode);
          } else {
            newNode = data.otherNode.copyTo(node, data.hitMode);
            if (mode === "link") {
              newNode.setTitle("Link to " + newNode.title);
            } else {
              newNode.setTitle("Copy of " + newNode.title);
            }
          }
        } else if (data.otherNodeData) {
          // Drop Fancytree node from different frame or window, so we only have
          // JSON representation available
          node.addChild(data.otherNodeData, data.hitMode);
        } else if (data.files.length) {
          // Drop files
          for(var i=0; i<data.files.length; i++) {
            var file = data.files[i];
            node.addNode( { title: "'" + file.name + "' (" + file.size + " bytes)" }, data.hitMode );
          }

        } else {
          // Drop a non-node
          node.addNode(
            {
              title: transfer.getData("text"),
            },
            data.hitMode
          );
        }
        node.setExpanded();
      },
    },
    // activate: function(event, data) {
    // },
    lazyLoad: function(event, data) {
      data.result = { url: "ajax-sub2.json" };
    },
  });

  lazyLogCache = {};

  /* Log if value changed, nor more than interval/sec.*/
  function logLazy(name, value, interval, msg) {
    if( !lazyLogCache[name] ) { lazyLogCache[name] = {stamp: now}};
    var now = Date.now(),
      entry = lazyLogCache[name];

    if( value && value === entry.value ) {
      return;
    }
    entry.value = value;

    if( interval > 0 && (now - entry.stamp) <= interval ) {
      return;
    }
    entry.stamp = now;
    lazyLogCache[name] = entry;
    console.log(msg);
  }



  // Sample button
  $("#button1").click(function() {
    var tree = $.ui.fancytree.getTree(),
      node = tree.findFirst(function(n) {
        return n.title === "The Hobbit";
      });

    node.toggleSelected();
  });

});



