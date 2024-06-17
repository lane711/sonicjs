export async function log(ctx, data) {
  console.log(data.message);

  const datadog_apikey =
    ctx && ctx.env && ctx.env.datadog_apikey ? ctx.env.datadog_apikey : null;

  if (datadog_apikey) {
    let dd_logsEndpoint =
      'https://http-intake.logs.datadoghq.com/v1/input/' + datadog_apikey;

    let datadog_service = ctx.env.datadog_service;

    // let hostname = request.headers.get('host') || ''

    // data to log
    data.ddsource = 'cloudflare';

    data.service = datadog_service;
    // ddtags: 'service:cloudflare,source:cloudflare,site:' + hostname,
    // hostname: hostname,
    // message: {
    //   date_access: Date.now(),
    //   http: {
    //     protocol: request.headers.get('X-Forwarded-Proto') || '',
    //     host: request.headers.get('host') || '',
    //     status_code: response.status,
    //     method: request.method,
    //     url_details: request.url,
    //     referer: request.headers.get('referer') || '',
    //   },
    //   useragent_details: {
    //     ua: request.headers.get('user-agent') || '',
    //   },
    //   network: {
    //     cc: request.headers.get('Cf-Ipcountry') || '',
    //   },
    //   cloudflare: {
    //     ray: request.headers.get('cf-ray') || '',
    //     visitor: request.headers.get('cf-visitor') || '',
    //   },
    // },
    // }

    await fetch(dd_logsEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}
