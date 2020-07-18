$(document).ready(async function () {
  // console.log('share service test: ' + sharedService.test());

  setupToolTips();

  setupAdminMenuMinimizer();
});

function submitForm(submission) {
  console.log("front end form submitting: ", submission);

  // send a POST request
  axios({
    method: "post",
    url: "/form-submission",
    data: {
      data: submission,
    },
  });
}

function slugify(text) {
  // console.log('slug', text);
  let slug = text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");

  return slug;
}

function setupToolTips() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      html: true,
    });
  });
}

function setupAdminMenuMinimizer() {
  $(".pb-wrapper .sidebar-minimizer").click(function () {
    Cookies.set("show-sidebar", false);
    toggleSidebar(false);
  });

  $(".sidebar-expander").click(function () {
    Cookies.set("show-sidebar", true);
    toggleSidebar(true);
  });
}

function toggleSidebar(showSidebar) {
  console.log(Cookies.get("show-sidebar"));
  if (showSidebar) {
    //opening
    $(".pb-wrapper").css("left", "0");
    $("main, .fixed-top, footer").css("margin-left", "260px");
    $(".sidebar-expander").css("left", "-60px");
  } else {
    //closing
    $(".pb-wrapper").css("left", "-260px");
    $("main, .fixed-top, footer").css("margin-left", "0");
    $(".sidebar-expander").css("left", "0");
  }
}
