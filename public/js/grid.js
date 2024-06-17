const url = window.location.href;
const authMode = url.includes('/auth/');
const gridWrapper = document.getElementById('grid');
if (gridWrapper) {
  const dataGrid = new gridjs.Grid({
    columns: [
      {
        name: 'Record',
        formatter: (displayValue) => gridjs.html(`${displayValue}`)
      },
      {
        name: 'Updated',
        formatter: (dt) =>
          gridjs.html(`<time class="timeSince" datetime="${dt}">${dt}</time>`)
      },
      {
        name: 'API',
        formatter: (editPath) => gridjs.html(`${editPath}`)
      },
      {
        name: 'Actions',
        formatter: (actionButtons) => gridjs.html(`${actionButtons}`)
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
      url: authMode
        ? `/admin/api/auth/${getTable()}`
        : `/admin/api/${getTable()}`,
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
                    record.displayValue,
                    record.updatedOn,
                    record.apiLink,
                    record.actionButtons
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
  }).render(gridWrapper);

  function deleteItem(itemId) {
    const basePath = `${window.location.protocol}//${window.location.host}`;
    const urlSegments = window.location.pathname.split('/');
    const tableName = urlSegments[urlSegments.length - 1];
    const endpoint = authMode
      ? `/v1/auth/${tableName}/${itemId}`
      : `${basePath}/v1/${tableName}/${itemId}`;

    const xhttp = new XMLHttpRequest();
    xhttp.open('DELETE', endpoint, true);
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 204) {
        window.location.reload();
      } else if (this.readyState === 4) {
        console.error('Error deleting the item:', this.responseText);
      }
    };
    xhttp.send();
  }

  gridWrapper.addEventListener('click', function (e) {
    if (e.target.closest('.delete-btn')) {
      const itemId = e.target
        .closest('.delete-btn')
        .getAttribute('data-delete-id');
      const userResponse = window.confirm(
        'Do you really want to delete this item?'
      );
      if (userResponse) deleteItem(itemId);
    }
  });
}

// $(document).on(".timeSince", function () {
//   // $(this).html('<b>yaay!</b>');
//   console.log("new time since");
// });

function getTable() {
  return $('#grid').data('route');
}
