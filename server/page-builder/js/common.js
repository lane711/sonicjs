$(document).ready(async function () {


  console.log('share service test: ' + sharedService.test());


});


function submitForm(submission) {
  console.log('front end form submitting: ', submission);

  // send a POST request
  axios({
    method: 'post',
    url: '/form-submission',
    data: submission
  });
}