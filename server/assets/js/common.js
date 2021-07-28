$(document).ready(async function () {
  // console.log('share service test: ' + sharedService.test());

  setupToolTips();
  setupFancyBox();
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

function setupToolTips() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      html: true,
    });
  });
}

function testFunction(echo) {
  return echo;
}

function setupFancyBox() {
  // debugger;
  if (typeof $.fancybox == "function") {
    Fancybox.bind("[data-fancybox]", {
      // Your options go here
    });
  } else {
    // fancy box not loaded;
  }

  // $("a.fancybox").fancybox({
  // 	'transitionIn'	:	'elastic',
  // 	'transitionOut'	:	'elastic',
  // 	'speedIn'		:	600,
  // 	'speedOut'		:	200,
  // 	'overlayShow'	:	false,
  //   'hideOnContentClick': true

  // });
}
