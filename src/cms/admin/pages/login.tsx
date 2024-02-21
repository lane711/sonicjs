import { Head, Script, ToggleTheme } from '../theme';
export const Login = (props: {
  children?: string;
  screenTitle?: string;
  showDemoCredentials?: boolean;
}) => {
  return (
    <html lang='en' data-bs-theme='auto'>
      <Head />
      <body>
        <ToggleTheme />
        <header class='navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            class='navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6'
            href='/admin'
          >
            <img class='logo' src='/public/images/sonicjs-logo.svg' />
          </a>
          <h1 class='h2 px-3 me-auto'>{props.screenTitle}</h1>
        </header>

        <div class='container-fluid'>
          <div class='row'>
            <main class='col-4 offset-4 px-md-4 py-md-5'>
              <h1>Login</h1>
              <DemoCredentials
                showDemoCredentials={props.showDemoCredentials}
              ></DemoCredentials>
              <p class='text-danger' id='login-errors'></p>
              <form id='formio-login'></form>
              {props.children}
            </main>
          </div>
        </div>

        <Script />
      </body>
    </html>
  );
};

export const DemoCredentials = (props: { showDemoCredentials?: boolean }) => {
  if (props.showDemoCredentials) {
    return (
      <div class='alert alert-primary d-flex align-items-center' role='alert'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          fill='currentColor'
          class='bi bi-exclamation-triangle-fill flex-shrink-0 me-2'
          viewBox='0 0 16 16'
          role='img'
          aria-label='Warning:'
        >
          <path d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' />
        </svg>
        <div>
          <b>Demo Login:</b>
          <br />
          demo@demo.com
          <br />
          sonicjs!
        </div>
      </div>
    );
  }
  return <></>;
};

export async function loadLogin(ctx) {
  const demoDomain = ctx.env.demo_domain;
  const showDemoCredentials =
    demoDomain && ctx.req.url.indexOf(demoDomain) > 0 ? true : false;
  return (
    <Login screenTitle='Login' showDemoCredentials={showDemoCredentials} />
  );
}

export const Setup = (props: { children?: string; screenTitle?: string }) => {
  return (
    <html lang='en' data-bs-theme='auto'>
      <Head />
      <body>
        <ToggleTheme />
        <header class='navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow'>
          <a
            class='navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6'
            href='/admin'
          >
            <img class='logo' src='/public/images/sonicjs-logo.svg' />
          </a>
          <h1 class='h2 px-3 me-auto'>{props.screenTitle}</h1>
        </header>

        <div class='container-fluid'>
          <div class='row'>
            <main class='col-6 offset-3 px-md-4 py-md-4'>
              <h2>Welcome to SonicJS!</h2>
              <h3>Setup your admin user to get started.</h3>

              <p class='text-danger' id='setup-errors'></p>

              <form id='formio-setup'></form>
              {props.children}
            </main>
          </div>
        </div>

        <Script />
      </body>
    </html>
  );
};
export async function loadSetup(ctx) {
  return <Setup screenTitle='Setup Admin User' />;
}
