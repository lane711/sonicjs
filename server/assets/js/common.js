$(document).ready(async function () {
  // console.log('share service test: ' + sharedService.test());

  setupToolTips();
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
