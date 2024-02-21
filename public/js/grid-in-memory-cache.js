const gridWrapperIM = document.getElementById('grid-in-memory-cache');
if (gridWrapperIM) {
  const dataGrid = new gridjs.Grid({
    columns: [
      {
        name: 'Key',
        formatter: (viewLink) => gridjs.html(`${viewLink}`)
      },
      {
        name: 'Created',
        formatter: (dt) =>
          gridjs.html(`<time class="timeSince" datetime="${dt}">${dt}</time>`)
      }
    ],
    pagination: {
      limit: 10,
      server: {
        url: (prev, page, limit) =>
          `${prev}?limit=${limit}&offset=${page * limit}`
      }
    },
    server: {
      url: `/admin/api/in-memory-cache`,
      data: (opts) => {
        return new Promise((resolve, reject) => {
          // let's implement our own HTTP client
          const xhttp = new XMLHttpRequest();
          const start = Date.now();

          xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
              if (this.status === 200) {
                const resp = JSON.parse(this.response);
                $('#executionTime').show();
                $('#executionTime span.serverTime').text(resp.executionTime);
                $('#executionTime span.source').text(resp.source);
                // make sure the output conforms to StorageResponse format:
                // https://github.com/grid-js/gridjs/blob/master/src/storage/storage.ts#L21-L24

                const end = Date.now();
                const clientExecutionTime = end - start;
                $('#executionTime span.clientTime').text(clientExecutionTime);
                resolve({
                  data: resp.data.map((record) => [
                    record.viewLink,
                    record.createdOn
                  ]),
                  total: resp.total
                });
              } else {
                reject();
              }
            }
          };
          xhttp.open('GET', opts.url, true);
          xhttp.send();
        });
      }
    }
  }).render(gridWrapperIM);
}

// $(document).on(".timeSince", function () {
//   // $(this).html('<b>yaay!</b>');
//   console.log("new time since");
// });

function getTable() {
  return $('#grid').data('route');
}
