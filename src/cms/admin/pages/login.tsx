import { Head, Script, ToggleTheme } from "../theme";
export const Login = (props: { children?: string; screenTitle?: string }) => {
  return (
    <html lang="en" data-bs-theme="auto">
      <Head />
      <body>
        <ToggleTheme />
        <header class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6"
            href="/admin"
          >
            <img class="logo" src="/public/images/sonicjs-logo.svg" />
          </a>
          <h1 class="h2 px-3 me-auto">{props.screenTitle}</h1>
        </header>

        <div class="container-fluid">
          <div class="row">
            <main class="col-6 offset-3 px-md-4 py-md-4">
              <p class="text-danger" id="login-errors"></p>
              <form id="formio-login"></form>
              {props.children}
            </main>
          </div>
        </div>

        <Script />
      </body>
    </html>
  );
};

export async function loadLogin(ctx) {
  return <Login screenTitle="Login" />;
}

export const Setup = (props: { children?: string; screenTitle?: string }) => {
  return (
    <html lang="en" data-bs-theme="auto">
      <Head />
      <body>
        <ToggleTheme />
        <header class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6"
            href="/admin"
          >
            <img class="logo" src="/public/images/sonicjs-logo.svg" />
          </a>
          <h1 class="h2 px-3 me-auto">{props.screenTitle}</h1>
        </header>

        <div class="container-fluid">
          <div class="row">
            <main class="col-6 offset-3 px-md-4 py-md-4">
              <h2>Welcome to SonicJS!</h2>
              <h3>Setup your admin user to get started.</h3>

              <p class="text-danger" id="login-errors"></p>

              <div id="formio" data-route="login"></div>
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
  return <Setup screenTitle="Setup Admin User" />;
}
