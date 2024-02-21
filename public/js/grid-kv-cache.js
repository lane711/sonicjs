const gridWrapperKV = document.getElementById('grid-kv-cache');
if (gridWrapperKV) {
  const dataGrid = new gridjs.Grid({
    columns: [
      {
        name: 'Key',
        formatter: (viewLink) => gridjs.html(`${viewLink}`)
      },
      'Created On'
    ],
    pagination: {
      limit: 10,
      server: {
        url: (prev, page, limit) =>
          `${prev}?limit=${limit}&offset=${page * limit}`
      }
    },
    server: {
      url: `/admin/api/kv-cache`,
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
  }).render(gridWrapperKV);
}
