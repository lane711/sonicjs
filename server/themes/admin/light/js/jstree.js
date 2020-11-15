$(document).ready(async function () {
  $(".new-menu").click(async function () {
    let links = [{ id: "home", parent: "#", text: "Home" }];
    var menu = {
      data: { title: "New Menu", contentType: "menu", links: links },
    };

    // debugger;
    await submitContent(menu);
    fullPageUpdate();
  });

  if (!$("#menuTree").length) {
    return;
  }

  $.jstree.defaults.core.data;
  $.jstree.defaults.core.check_callback = true;

  // let data = [{"id":"6e0ylrz3jei","text":"Hello world","icon":true,"li_attr":{"id":"6e0ylrz3jei"},"a_attr":{"href":"#","id":"6e0ylrz3jei_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"parent":"#"},{"id":"hhcfvv536od","text":"Hello world","icon":true,"li_attr":{"id":"hhcfvv536od"},"a_attr":{"href":"#","id":"hhcfvv536od_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"parent":"#"},{"id":"0obhtupblz0g","text":"Hello world","icon":true,"li_attr":{"id":"0obhtupblz0g"},"a_attr":{"href":"#","id":"0obhtupblz0g_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"parent":"hhcfvv536od"},{"id":"4dv3m57umea","text":"Hello world","icon":true,"li_attr":{"id":"4dv3m57umea"},"a_attr":{"href":"#","id":"4dv3m57umea_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"parent":"#"},{"id":"5fuafoc66db","text":"Hello world","icon":true,"li_attr":{"id":"5fuafoc66db"},"a_attr":{"href":"#","id":"5fuafoc66db_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"parent":"4dv3m57umea"},{"id":"ykmqwe7m2dp","text":"Hello world","icon":true,"li_attr":{"id":"ykmqwe7m2dp"},"a_attr":{"href":"#","id":"ykmqwe7m2dp_anchor"},"state":{"loaded":true,"opened":false,"selected":true,"disabled":false},"data":{},"parent":"4dv3m57umea"}];
  $("#menuTree").jstree({
    core: {
      data: menuData,
    },

    types: {
      default: {
        icon: "fa fa-chevron-right",
      },
      demo: {
        icon: "fa fa-home",
      },
    },

    plugins: ["dnd", "types"],
  });

  $(document).on("dnd_stop.vakata", function (e, data) {
    console.log("done dnd");
    updateTreeData();
    $("#menuTree").jstree("open_all");
  });

  $("#menuTree").on("changed.jstree", async function (e, data) {
    if (!data.selected) {
      return;
    }

    let content = {};
    if (data && data.node && data.node.data) {
      content = { data: data.node.data };
    } else {
      return;
    }

    // debugger;

    let form = await formService.getForm(
      "menu",
      content,
      "addModuleToColumn(submission)"
    );

    // debugger;

    $("#menuTreeForm").empty();
    $("#menuTreeForm").html(form);

    formInit();

    $("#menuTreeForm #title").focus();
  });

  $("#menuTree").bind("loaded.jstree", function (e, data) {
    // debugger;
    $(this).jstree("open_all");
    // $('#menuTree').jstree('select_node', 'ul > li:first');
    // $('#menuTree').jstree('select_node', 'someNodeId');
    $("#menuTree").jstree().deselect_all(true);

    $("#menuTree").jstree("select_node", ".jstree-container-ul li:first");
  });

  $("#addNode").on("click", function () {
    let randomId = Math.random().toString(36).slice(2);
    var parent = "#";
    var node = {
      id: randomId,
      text: "New Link",
      data: { id: randomId, title: "New Link", url: "/", showInMenu: true },
    };
    let newId = $("#menuTree").jstree("create_node", parent, node, "last");
    // console.log(newId);
    updateTreeData();

    //select new node
    $("#menuTree").jstree().deselect_all(true);

    $("#menuTree").jstree("select_node", ".jstree-container-ul li:last");
  });

  $("#deleteNode").on("click", function () {
    let id = $("#menuTreeForm #id").val();

    $("#menuTree").jstree().delete_node([id]);

    updateTreeData();

    $("#menuTree").jstree("select_node", ".jstree-container-ul li:first");
  });

  $("#menuMainEdit").on("change", "#title", function () {
    updateTreeData();
  });
});

function updateTreeData(formData) {
  var selectedNode = $("#menuTree").jstree("get_selected", true)[0];

  if (selectedNode && formData) {
    selectedNode.text = formData.data.title;
    selectedNode.data = formData.data;
    $("#menuTree").jstree("set_text", selectedNode, formData.data.title);
  }

  // debugger;
  let menuTitle = $("#menuMainEdit #title").val();

  var links = $("#menuTree").jstree(true).get_json("#", { flat: false });

  var menu = { data: { title: menuTitle, contentType: "menu", links: links } };

  let id = $("#id").val();
  if (id) {
    menu.data.id = id;
  }

  if (menu.data.title) {
    submitContent(menu, false);
  }
}

function formChanged(formData) {
  if (!$("#menuTree").length) {
    return;
  }
  // console.log("jstree formData", formData);
  updateTreeData(formData);
}
