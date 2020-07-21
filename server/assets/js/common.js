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
