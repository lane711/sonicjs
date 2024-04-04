export const LoginWrapper = (props: {
  children?: any;
  screenTitle: string;
  errorTitle: string;
  formTitle: string;
  loginScreenTitle: string;
  loginScreenIntro: string;
}) => {
  return (
    <>
      <section class='dark:bg-neutral-900 dark:text-white grid grid-teste'>
        <div class='  py-12 px-12 w-screen md:w-auto md:px-24'>
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
              <h1 class='text-xl font-bold tracking-wider'>
                {props.loginScreenTitle}
              </h1>
              <p class='text-sm'>{props.loginScreenIntro}</p>
            </div>
          </header>
          <article class=''>
            <h1 class='text-5xl font-bold my-10'>{props.screenTitle}</h1>
            <p
              class='empty:opacity-0 empty:p-0 empty:m-0 dark:text-red-800 text-red-800  border-2 border-red-600 flex p-2 my-10 rounded bg-red-100'
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
      <Script />
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

export const ThemeToggle = () => {
  return (
    <>
      <label class='switch'>
        <input
          class='switch__input'
          name='themeToggle'
          type='checkbox'
          role='switch'
        />
        <svg
          class='switch__icon switch__icon--light'
          viewBox='0 0 12 12'
          width='12px'
          height='12px'
          aria-hidden='true'
        >
          <g fill='none' stroke='#fff' stroke-width='1' stroke-linecap='round'>
            <circle cx='6' cy='6' r='2' />
            <g stroke-dasharray='1.5 1.5'>
              <polyline points='6 10,6 11.5' transform='rotate(0,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(45,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(90,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(135,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(180,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(225,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(270,6,6)' />
              <polyline points='6 10,6 11.5' transform='rotate(315,6,6)' />
            </g>
          </g>
        </svg>
        <svg
          class='switch__icon switch__icon--dark'
          viewBox='0 0 12 12'
          width='12px'
          height='12px'
          aria-hidden='true'
        >
          <g
            fill='none'
            stroke='#fff'
            stroke-width='1'
            stroke-linejoin='round'
            transform='rotate(-45,6,6)'
          >
            <path d='m9,10c-2.209,0-4-1.791-4-4s1.791-4,4-4c.304,0,.598.041.883.105-.995-.992-2.367-1.605-3.883-1.605C2.962.5.5,2.962.5,6s2.462,5.5,5.5,5.5c1.516,0,2.888-.613,3.883-1.605-.285.064-.578.105-.883.105Z' />
          </g>
        </svg>
        <span class='switch__sr'>Dark Mode</span>
      </label>
    </>
  );
};
export const Script = () => {
  return (
    <>
      <script
        src='https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js'
        integrity='sha512-uMtXmF28A2Ab/JJO2t/vYhlaa/3ahUOgj1Zf27M5rOo8/+fcTUVH0/E0ll68njmjrLqOBjXM3V9NiPFL5ywWPQ=='
        crossorigin='anonymous'
        referrerpolicy='no-referrer'
      ></script>
      <script src='https://cdn.form.io/formiojs/formio.full.min.js'></script>
      <script src='/public/js/form-login.js'></script>
      <script src='/public/js/theme-tailwind.js'></script>
    </>
  );
};
