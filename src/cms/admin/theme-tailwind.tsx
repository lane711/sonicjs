export const HTML = (props: {
  children?: any;
  screenTitle?: string;
  showDemoCredentials?: boolean;
}) => {
  return (
    <html lang='en' data-bs-theme='auto'>
      {props.children}
    </html>
  );
};
export const LoginWrapper = (props: {
  children?: any;
  screenTitle: string;
  errorTitle: string;
  formTitle: string;
}) => {
  return (
    <>
      <section class='grid grid-teste'>
        <div class='py-12 px-12 w-screen md:w-auto md:px-24'>
          <header class=''>
            <a href='/admin'>
              <figure class='bg-neutral-900 rounded mr-4 min-h-16 min-w-16 flex items-center justify-center'>
                <img
                  src='/public/images/sonicjs-logo.svg'
                  alt=''
                  class='h-12'
                />
              </figure>
            </a>
            <div class='mt-2'>
              <h1 class='text-xl font-bold tracking-wider'>SonicJS</h1>
              <p class='text-sm'>Welcome to the Admin Panel</p>
            </div>
          </header>
          <article>
            <h1 class='text-5xl font-bold my-10'>{props.screenTitle}</h1>
            <p
              class='empty:opacity-0 empty:p-0 empty:m-0  border-2 border-red-600 flex p-2 my-10 rounded bg-red-100'
              id={props.errorTitle}
            ></p>
            <form id={props.formTitle} class='login-form'></form>
            {props.children}
          </article>
        </div>
        <div>
          <img
            src='https://source.unsplash.com/random'
            alt=''
            class='h-screen w-screen object-cover object-center'
          />
        </div>
      </section>
      <script
        src='https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js'
        integrity='sha512-uMtXmF28A2Ab/JJO2t/vYhlaa/3ahUOgj1Zf27M5rOo8/+fcTUVH0/E0ll68njmjrLqOBjXM3V9NiPFL5ywWPQ=='
        crossorigin='anonymous'
        referrerpolicy='no-referrer'
      ></script>
      <script src='https://cdn.form.io/formiojs/formio.full.min.js'></script>
      <script src='/public/js/form-login.js'></script>
    </>
  );
};
export const Head = () => {
  return (
    <head>
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='description' content='' />

      <title>SonicJs Admin</title>
      <link rel='icon' type='image/x-icon' href='/public/images/favicon.ico' />
      <link rel='stylesheet' href='/public/css/tailwind.css' />
    </head>
  );
};
