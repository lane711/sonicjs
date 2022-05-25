// JS File for Module: vote

$(document).ready(function () {});

function vote(id, vote) {
  console.log("vote up", id, vote, axios);

  const payload = { id, vote };
  axiosInstance
    .post("/vote-api", payload)
    .then(async function (response) {
      // debugger;
      console.log(response);
      // return await response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}
