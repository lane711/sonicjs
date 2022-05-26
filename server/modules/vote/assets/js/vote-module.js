// JS File for Module: vote

function vote(id, vote) {
  const payload = { id, vote };
  axiosInstance
    .post("/vote-api", payload)
    .then(function (response) {
      $(`[data-vote-controls-id="${response.data.id}"] .voteUps`).text(response.data.data.voteUps);
      $(`[data-vote-controls-id="${response.data.id}"] .voteDowns`).text(response.data.data.voteDowns)
    })
    .catch(function (error) {
      console.log(error);
    });
}
