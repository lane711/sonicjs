import { __esm, __export, __toCommonJS } from './chunk-V4OQ3NZ2.js';

// src/templates/components/logo.template.ts
function renderLogo(data = {}) {
  const {
    size = "md",
    variant = "default",
    showText = true,
    showVersion = true,
    version = "v0.1.0",
    className = "",
    href
  } = data;
  const sizeClass = sizeClasses[size];
  const logoSvg = `
    <svg class="${sizeClass} ${className}" viewBox="380 1300 2250 400" aria-hidden="true">
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M476.851,1404.673h168.536c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.866-7.222,4.866-11.943    c0-2.357-0.443-4.569-1.327-6.636c-0.885-2.06-2.067-3.829-3.539-5.308c-1.479-1.472-3.249-2.654-5.308-3.538    c-2.067-0.885-4.279-1.327-6.635-1.327H476.851c-20.057,0-37.158,7.154-51.313,21.454c-14.155,14.308-21.233,31.483-21.233,51.534    c0,20.058,7.078,37.234,21.233,51.534c14.155,14.308,31.255,21.454,51.313,21.454h112.357c10.907,0,20.196,3.837,27.868,11.502    c7.666,7.672,11.502,16.885,11.502,27.646c0,10.769-3.836,19.982-11.502,27.647c-7.672,7.673-16.961,11.502-27.868,11.502H421.115    c-4.721,0-8.702,1.624-11.944,4.865c-3.248,3.249-4.866,7.23-4.866,11.944c0,3.248,0.733,6.123,2.212,8.626    c1.472,2.509,3.462,4.499,5.971,5.972c2.502,1.472,5.378,2.212,8.626,2.212h168.094c20.052,0,37.227-7.078,51.534-21.234    c14.3-14.155,21.454-31.331,21.454-51.534c0-20.196-7.154-37.379-21.454-51.534c-14.308-14.156-31.483-21.234-51.534-21.234    H476.851c-10.616,0-19.76-3.905-27.426-11.721c-7.672-7.811-11.501-17.101-11.501-27.87c0-10.761,3.829-19.975,11.501-27.647    C457.091,1408.508,466.235,1404.673,476.851,1404.673z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M974.78,1398.211c-5.016,6.574-10.034,13.146-15.048,19.721c-1.828,2.398-3.657,4.796-5.487,7.194    c1.994,1.719,3.958,3.51,5.873,5.424c18.724,18.731,28.089,41.216,28.089,67.459c0,26.251-9.366,48.658-28.089,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-9.848,0-19.156-1.308-27.923-3.923l-4.185,3.354    c-8.587,6.885-17.154,13.796-25.725,20.702c17.52,8.967,36.86,13.487,58.054,13.487c35.533,0,65.91-12.608,91.124-37.821    c25.214-25.215,37.821-55.584,37.821-91.125c0-35.534-12.607-65.911-37.821-91.126    C981.004,1403.663,977.926,1400.854,974.78,1398.211z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1364.644,1439.619c-4.72,0-8.702,1.624-11.943,4.865c-3.249,3.249-4.866,7.23-4.866,11.944v138.014    l-167.651-211.003c-0.297-0.586-0.74-1.03-1.327-1.326c-4.721-4.714-10.249-7.742-16.588-9.069    c-6.346-1.326-12.608-0.732-18.801,1.77c-6.192,2.509-11.059,6.49-14.598,11.944c-3.539,5.46-5.308,11.577-5.308,18.357v208.348    c0,4.721,1.618,8.703,4.866,11.944c3.241,3.241,7.222,4.865,11.943,4.865c2.945,0,5.751-0.738,8.405-2.211    c2.654-1.472,4.713-3.463,6.193-5.971c1.473-2.503,2.212-5.378,2.212-8.627v-205.251l166.325,209.675    c2.06,2.654,4.423,4.865,7.078,6.635c5.308,3.829,11.349,5.75,18.137,5.75c5.308,0,10.464-1.182,15.482-3.538    c3.539-1.769,6.56-4.127,9.069-7.078c2.502-2.945,4.491-6.338,5.971-10.175c1.473-3.829,2.212-7.664,2.212-11.501v-141.552    c0-4.714-1.624-8.695-4.865-11.944C1373.339,1441.243,1369.359,1439.619,1364.644,1439.619z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1508.406,1432.983c-2.654-1.472-5.46-2.212-8.404-2.212c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.395-4.865,7.3-4.865,11.723v163.228c0,4.721,1.616,8.702,4.865,11.943c3.241,3.249,7.223,4.866,11.944,4.866    c2.944,0,5.751-0.732,8.404-2.212c2.655-1.472,4.714-3.539,6.193-6.194c1.473-2.654,2.213-5.453,2.213-8.404V1447.58    c0-2.945-0.74-5.75-2.213-8.405C1513.12,1436.522,1511.06,1434.462,1508.406,1432.983z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1499.78,1367.957c-4.575,0-8.481,1.625-11.722,4.866c-3.249,3.249-4.865,7.23-4.865,11.943    c0,2.951,0.732,5.75,2.212,8.405c1.472,2.654,3.463,4.721,5.971,6.193c2.503,1.479,5.378,2.212,8.627,2.212    c4.423,0,8.328-1.618,11.721-4.865c3.387-3.243,5.088-7.224,5.088-11.944c0-4.713-1.701-8.694-5.088-11.943    C1508.33,1369.582,1504.349,1367.957,1499.78,1367.957z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1859.627,1369.727H1747.27c-35.388,0-65.69,12.607-90.904,37.821    c-25.213,25.215-37.82,55.591-37.82,91.125c0,35.54,12.607,65.911,37.82,91.125c25.215,25.215,55.516,37.821,90.904,37.821h56.178    c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943c0-4.714-1.624-8.695-4.865-11.943    c-3.249-3.243-7.23-4.866-11.944-4.866h-56.178c-26.251,0-48.659-9.359-67.237-28.09c-18.579-18.723-27.868-41.207-27.868-67.459    c0-26.243,9.29-48.659,27.868-67.237c18.579-18.579,40.987-27.868,67.237-27.868h112.357c4.714,0,8.696-1.693,11.944-5.087    c3.241-3.387,4.865-7.368,4.865-11.943c0-4.569-1.624-8.475-4.865-11.723C1868.322,1371.351,1864.341,1369.727,1859.627,1369.727z    "></path>
      <path fill="#06b6d4" d="M2219.256,1371.054h-112.357c-4.423,0-8.336,1.624-11.723,4.865c-3.393,3.249-5.087,7.23-5.087,11.944    c0,4.721,1.694,8.702,5.087,11.943c3.387,3.249,7.3,4.866,11.723,4.866h95.547v95.105c0,26.251-9.365,48.659-28.088,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-26.251,0-48.659-9.289-67.237-27.868c-18.579-18.579-27.868-40.987-27.868-67.237    c0-4.713-1.701-8.771-5.088-12.165c-3.393-3.387-7.374-5.087-11.943-5.087c-4.575,0-8.481,1.7-11.722,5.087    c-3.249,3.393-4.865,7.451-4.865,12.165c0,35.388,12.607,65.69,37.82,90.904c25.215,25.213,55.584,37.82,91.126,37.82    c35.532,0,65.91-12.607,91.125-37.82c25.214-25.215,37.82-55.516,37.82-90.904v-111.915c0-4.714-1.624-8.695-4.865-11.944    C2227.951,1372.678,2223.971,1371.054,2219.256,1371.054z"></path>
      <path fill="#06b6d4" d="M2574.24,1502.875c-14.306-14.156-31.483-21.234-51.533-21.234H2410.35    c-10.617,0-19.762-3.829-27.426-11.501c-7.672-7.664-11.501-16.954-11.501-27.868c0-10.907,3.829-20.196,11.501-27.868    c7.664-7.664,16.809-11.501,27.426-11.501h112.357c4.714,0,8.695-1.617,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943    c0-4.714-1.624-8.695-4.865-11.944c-3.249-3.241-7.23-4.865-11.944-4.865H2410.35c-20.058,0-37.158,7.154-51.313,21.454    c-14.156,14.308-21.232,31.483-21.232,51.534c0,20.058,7.077,37.234,21.232,51.534c14.156,14.308,31.255,21.454,51.313,21.454    h112.357c7.078,0,13.637,1.77,19.684,5.308c6.042,3.539,10.838,8.336,14.377,14.377c3.538,6.047,5.307,12.607,5.307,19.685    c0,10.616-3.835,19.76-11.501,27.425c-7.672,7.673-16.961,11.502-27.868,11.502h-168.094c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.393-4.865,7.374-4.865,11.943c0,4.576,1.616,8.481,4.865,11.723c3.241,3.249,7.223,4.866,11.944,4.866h168.094    c20.051,0,37.227-7.078,51.533-21.234c14.302-14.155,21.454-31.331,21.454-51.534    C2595.695,1534.213,2588.542,1517.03,2574.24,1502.875z"></path>
      <path fill="#06b6d4" d="M854.024,1585.195l20.001-16.028c16.616-13.507,33.04-27.265,50.086-40.251    c1.13-0.861,2.9-1.686,2.003-3.516c-0.843-1.716-2.481-2.302-4.484-2.123c-8.514,0.765-17.016-0.538-25.537-0.353    c-1.124,0.024-2.768,0.221-3.163-1.25c-0.371-1.369,1.088-2.063,1.919-2.894c6.26-6.242,12.574-12.43,18.816-18.691    c9.303-9.327,18.565-18.714,27.851-28.066c1.848-1.859,3.701-3.713,5.549-5.572c2.655-2.661,5.309-5.315,7.958-7.982    c0.574-0.579,1.259-1.141,1.246-1.94c-0.004-0.257-0.078-0.538-0.254-0.853c-0.556-0.981-1.441-1.1-2.469-0.957    c-0.658,0.096-1.315,0.185-1.973,0.275c-3.844,0.538-7.689,1.076-11.533,1.608c-3.641,0.505-7.281,1.02-10.922,1.529    c-4.162,0.582-8.324,1.158-12.486,1.748c-1.142,0.161-2.409,1.662-3.354,0.508c-0.419-0.508-0.431-1.028-0.251-1.531    c0.269-0.741,0.957-1.441,1.387-2.021c3.414-4.58,6.882-9.124,10.356-13.662c1.74-2.272,3.48-4.544,5.214-6.822    c4.682-6.141,9.369-12.281,14.051-18.422c0.09-0.119,0.181-0.237,0.271-0.355c6.848-8.98,13.7-17.958,20.553-26.936    c0.488-0.64,0.977-1.28,1.465-1.92c2.159-2.828,4.315-5.658,6.476-8.486c4.197-5.501,8.454-10.954,12.67-16.442    c0.263-0.347,0.538-0.718,0.717-1.106c0.269-0.586,0.299-1.196-0.335-1.776c-0.825-0.753-1.8-0.15-2.595,0.419    c-0.67,0.472-1.333,0.957-1.955,1.489c-2.206,1.889-4.401,3.797-6.595,5.698c-3.958,3.438-7.922,6.876-11.976,10.194    c-2.443,2.003-4.865,4.028-7.301,6.038c-18.689-10.581-39.53-15.906-62.549-15.906c-35.54,0-65.911,12.607-91.125,37.82    c-25.214,25.215-37.821,55.592-37.821,91.126c0,35.54,12.607,65.91,37.821,91.125c4.146,4.146,8.445,7.916,12.87,11.381    c-9.015,11.14-18.036,22.277-27.034,33.429c-1.208,1.489-3.755,3.151-2.745,4.891c0.078,0.144,0.173,0.281,0.305,0.425    c1.321,1.429,3.492-1.303,4.933-2.457c6.673-5.333,13.333-10.685,19.982-16.042c3.707-2.984,7.417-5.965,11.124-8.952    c1.474-1.188,2.951-2.373,4.425-3.561c6.41-5.164,12.816-10.333,19.238-15.481L854.024,1585.195z M797.552,1498.009    c0-26.243,9.29-48.728,27.868-67.459c18.579-18.723,40.987-28.089,67.238-28.089c12.273,0,23.712,2.075,34.34,6.171    c-3.37,2.905-6.734,5.816-10.069,8.762c-6.075,5.351-12.365,10.469-18.667,15.564c-4.179,3.378-8.371,6.744-12.514,10.164    c-7.54,6.23-15.037,12.52-22.529,18.804c-7.091,5.955-14.182,11.904-21.19,17.949c-1.136,0.974-3.055,1.907-2.135,3.94    c0.831,1.836,2.774,1.417,4.341,1.578l12.145-0.599l14.151-0.698c1.031-0.102,2.192-0.257,2.89,0.632    c0.034,0.044,0.073,0.078,0.106,0.127c1.017,1.561-0.67,2.105-1.387,2.942c-6.308,7.318-12.616,14.637-18.978,21.907    c-8.161,9.339-16.353,18.649-24.544,27.958c-2.146,2.433-4.275,4.879-6.422,7.312c-1.034,1.172-2.129,2.272-1.238,3.922    c0.933,1.728,2.685,1.752,4.323,1.602c4.134-0.367,8.263-0.489,12.396-0.492c0.242,0,0.485-0.005,0.728-0.004    c2.711,0.009,5.422,0.068,8.134,0.145c2.582,0.074,5.166,0.165,7.752,0.249c0.275,1.62-0.879,2.356-1.62,3.259    c-1.333,1.626-2.667,3.247-4,4.867c-4.315,5.252-8.62,10.514-12.928,15.772c-3.562-2.725-7.007-5.733-10.324-9.051    C806.842,1546.667,797.552,1524.26,797.552,1498.009z"></path>
    </svg>
  `;
  const versionBadge = showVersion ? `
    <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variant === "white" ? "bg-white/10 text-white/80 ring-white/20" : "bg-cyan-50 text-cyan-700 ring-cyan-700/10 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20"}">
      ${version}
    </span>
  ` : "";
  const logoContent = showText ? `
    <div class="flex items-center gap-2 ${className}">
      ${logoSvg}
      ${versionBadge}
    </div>
  ` : logoSvg;
  if (href) {
    return `<a href="${href}" class="inline-block hover:opacity-80 transition-opacity">${logoContent}</a>`;
  }
  return logoContent;
}
var sizeClasses;
var init_logo_template = __esm({
  "src/templates/components/logo.template.ts"() {
    sizeClasses = {
      sm: "h-6 w-auto",
      md: "h-8 w-auto",
      lg: "h-12 w-auto",
      xl: "h-16 w-auto"
    };
  }
});

// src/templates/layouts/admin-layout-catalyst.template.ts
var admin_layout_catalyst_template_exports = {};
__export(admin_layout_catalyst_template_exports, {
  renderAdminLayoutCatalyst: () => renderAdminLayoutCatalyst,
  renderCatalystCheckbox: () => renderCatalystCheckbox
});
function renderCatalystCheckbox(props) {
  const {
    id,
    name,
    checked = false,
    disabled = false,
    label,
    description,
    color = "dark/zinc",
    className = ""
  } = props;
  const colorClasses = {
    "dark/zinc": "peer-checked:bg-zinc-900 peer-checked:before:bg-zinc-900 dark:peer-checked:bg-zinc-600",
    "dark/white": "peer-checked:bg-zinc-900 peer-checked:before:bg-zinc-900 dark:peer-checked:bg-white",
    "white": "peer-checked:bg-white peer-checked:before:bg-white",
    "dark": "peer-checked:bg-zinc-900 peer-checked:before:bg-zinc-900",
    "zinc": "peer-checked:bg-zinc-600 peer-checked:before:bg-zinc-600",
    "blue": "peer-checked:bg-blue-600 peer-checked:before:bg-blue-600",
    "green": "peer-checked:bg-green-600 peer-checked:before:bg-green-600",
    "red": "peer-checked:bg-red-600 peer-checked:before:bg-red-600"
  };
  const checkColor = color === "dark/white" ? "dark:text-zinc-900" : "text-white";
  const baseClasses = `
    relative isolate flex w-4 h-4 items-center justify-center rounded-[0.3125rem]
    before:absolute before:inset-0 before:-z-10 before:rounded-[calc(0.3125rem-1px)] before:bg-white before:shadow-sm
    dark:before:hidden
    dark:bg-white/5
    border border-zinc-950/15 peer-checked:border-transparent
    dark:border-white/15 dark:peer-checked:border-white/5
    peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-blue-500
    peer-disabled:opacity-50
    peer-disabled:border-zinc-950/25 peer-disabled:bg-zinc-950/5
    dark:peer-disabled:border-white/20 dark:peer-disabled:bg-white/2.5
  `.trim().replace(/\s+/g, " ");
  const checkIconClasses = `
    w-4 h-4 opacity-0 peer-checked:opacity-100 pointer-events-none
  `.trim().replace(/\s+/g, " ");
  if (description) {
    return `
      <div class="grid grid-cols-[1.125rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[1rem_1fr] ${className}">
        <div class="col-start-1 row-start-1 mt-0.75 sm:mt-1">
          <input
            type="checkbox"
            id="${id}"
            name="${name}"
            ${checked ? "checked" : ""}
            ${disabled ? "disabled" : ""}
            class="peer sr-only"
          />
          <label for="${id}" class="inline-flex cursor-pointer">
            <span class="${baseClasses} ${colorClasses[color] || colorClasses["dark/zinc"]}">
              <svg class="${checkIconClasses} ${checkColor}" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </label>
        </div>
        ${label ? `<label for="${id}" class="col-start-2 row-start-1 text-sm/6 font-medium text-zinc-950 dark:text-white cursor-pointer">${label}</label>` : ""}
        ${description ? `<p class="col-start-2 row-start-2 text-sm/6 text-zinc-500 dark:text-zinc-400">${description}</p>` : ""}
      </div>
    `;
  } else {
    return `
      <label class="inline-flex items-center gap-3 cursor-pointer ${className}">
        <input
          type="checkbox"
          id="${id}"
          name="${name}"
          ${checked ? "checked" : ""}
          ${disabled ? "disabled" : ""}
          class="peer sr-only"
        />
        <span class="${baseClasses} ${colorClasses[color] || colorClasses["dark/zinc"]}">
          <svg class="${checkIconClasses} ${checkColor}" viewBox="0 0 14 14" fill="none" stroke="currentColor">
            <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        ${label ? `<span class="text-sm/6 font-medium text-zinc-950 dark:text-white">${label}</span>` : ""}
      </label>
    `;
  }
}
function renderAdminLayoutCatalyst(data) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - SonicJS AI Admin</title>
  <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
              950: '#09090b'
            }
          }
        }
      }
    }
  </script>

  <!-- Additional Styles -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #27272a;
    }

    ::-webkit-scrollbar-thumb {
      background: #52525b;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #71717a;
    }

    /* Smooth transitions */
    * {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  </style>

  <!-- Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  ${data.styles ? data.styles.map((style) => `<link rel="stylesheet" href="${style}">`).join("\n  ") : ""}
  ${data.scripts ? data.scripts.map((script) => `<script src="${script}"></script>`).join("\n  ") : ""}
</head>
<body class="min-h-screen bg-white dark:bg-zinc-900">
  <div class="relative isolate flex min-h-svh w-full max-lg:flex-col lg:bg-zinc-100 dark:lg:bg-zinc-950">
    <!-- Sidebar on desktop -->
    <div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
      ${renderCatalystSidebar(
    data.currentPath,
    data.user,
    data.dynamicMenuItems,
    false,
    data.version,
    data.enableExperimentalFeatures
  )}
    </div>

    <!-- Mobile sidebar (hidden by default) -->
    <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-black/30 lg:hidden hidden z-40" onclick="closeMobileSidebar()"></div>
    <div id="mobile-sidebar" class="fixed inset-y-0 left-0 w-80 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden z-50">
      ${renderCatalystSidebar(
    data.currentPath,
    data.user,
    data.dynamicMenuItems,
    true,
    data.version,
    data.enableExperimentalFeatures
  )}
    </div>

    <!-- Main content area -->
    <main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pr-2 lg:pl-64">
      <!-- Mobile header with menu toggle -->
      <header class="flex items-center px-4 py-2.5 lg:hidden border-b border-zinc-950/5 dark:border-white/5">
        <button onclick="openMobileSidebar()" class="relative flex items-center justify-center rounded-lg p-2 text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5" aria-label="Open navigation">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
          </svg>
        </button>
        <div class="ml-4 flex-1">
          ${renderLogo({ size: "sm", showText: true, variant: "white", version: data.version, href: "/admin" })}
        </div>
      </header>

      <!-- Content -->
      <div class="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        ${data.content}
      </div>
    </main>
  </div>

  <!-- Notification Container -->
  <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <script>
    // Mobile sidebar toggle
    function openMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    }

    function closeMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }

    // User dropdown toggle
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      dropdown.classList.toggle('hidden');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('userDropdown');
      const button = event.target.closest('[data-user-menu]');
      if (!button && dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Show notification
    function showNotification(message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      const colors = {
        success: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20',
        error: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20',
        warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
        info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20'
      };

      notification.className = \`rounded-lg p-4 ring-1 \${colors[type] || colors.info} max-w-sm shadow-lg\`;
      notification.innerHTML = \`
        <div class="flex items-center justify-between">
          <span class="text-sm">\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      \`;

      container.appendChild(notification);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }

    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'false') {
      document.documentElement.classList.remove('dark');
    }
  </script>
</body>
</html>`;
}
function renderCatalystSidebar(currentPath = "", user, dynamicMenuItems, isMobile = false, version, enableExperimentalFeatures) {
  let baseMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`
    },
    {
      label: "Collections",
      path: "/admin/collections",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
      </svg>`
    },
    {
      label: "Content",
      path: "/admin/content",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "Media",
      path: "/admin/media",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>`
    }
  ];
  if (enableExperimentalFeatures) {
    baseMenuItems.push({
      label: "Plugins",
      path: "/admin/plugins",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`
    });
  }
  const settingsMenuItem = {
    label: "Settings",
    path: "/admin/settings",
    icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
    </svg>`
  };
  const allMenuItems = [...baseMenuItems];
  if (dynamicMenuItems && dynamicMenuItems.length > 0) {
    const usersIndex = allMenuItems.findIndex(
      (item) => item.path === "/admin/users"
    );
    if (usersIndex !== -1) {
      allMenuItems.splice(usersIndex + 1, 0, ...dynamicMenuItems);
    } else {
      allMenuItems.push(...dynamicMenuItems);
    }
  }
  const closeButton = isMobile ? `
    <div class="-mb-3 px-4 pt-3">
      <button onclick="closeMobileSidebar()" class="relative flex w-full items-center gap-3 rounded-lg p-2 text-left text-base/6 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5 sm:text-sm/5" aria-label="Close navigation">
        <svg class="h-5 w-5 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
        <span>Close menu</span>
      </button>
    </div>
  ` : "";
  return `
    <nav class="flex h-full min-h-0 flex-col bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 ${isMobile ? "rounded-lg p-2 m-2" : ""}">
      ${closeButton}

      <!-- Sidebar Header -->
      <div class="flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5">
        ${renderLogo({ size: "md", showText: true, variant: "white", version, href: "/admin" })}
      </div>

      <!-- Sidebar Body -->
      <div class="flex flex-1 flex-col overflow-y-auto p-4">
        <div class="flex flex-col gap-0.5">
          ${allMenuItems.map((item) => {
    const isActive = currentPath === item.path || item.path !== "/admin" && currentPath?.startsWith(item.path);
    return `
              <span class="relative">
                ${isActive ? `
                  <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
                ` : ""}
                <a
                  href="${item.path}"
                  class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium ${isActive ? "text-zinc-950 dark:text-white" : "text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"}"
                  ${isActive ? 'data-current="true"' : ""}
                >
                  <span class="shrink-0 ${isActive ? "fill-zinc-950 dark:fill-white" : "fill-zinc-500 dark:fill-zinc-400"}">
                    ${item.icon}
                  </span>
                  <span class="truncate">${item.label}</span>
                </a>
              </span>
            `;
  }).join("")}
        </div>
      </div>

      <!-- Settings Menu Item (Bottom) -->
      <div class="border-t border-zinc-950/5 p-4 dark:border-white/5">
        ${(() => {
    const isActive = currentPath === settingsMenuItem.path || currentPath?.startsWith(settingsMenuItem.path);
    return `
            <span class="relative">
              ${isActive ? `
                <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
              ` : ""}
              <a
                href="${settingsMenuItem.path}"
                class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium ${isActive ? "text-zinc-950 dark:text-white" : "text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"}"
                ${isActive ? 'data-current="true"' : ""}
              >
                <span class="shrink-0 ${isActive ? "fill-zinc-950 dark:fill-white" : "fill-zinc-500 dark:fill-zinc-400"}">
                  ${settingsMenuItem.icon}
                </span>
                <span class="truncate">${settingsMenuItem.label}</span>
              </a>
            </span>
          `;
  })()}
      </div>

      <!-- Sidebar Footer (User) -->
      ${user ? `
        <div class="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5">
          <div class="relative">
            <button
              data-user-menu
              onclick="toggleUserDropdown()"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <span class="text-xs font-semibold">${(user.name || user.email || "U").charAt(0).toUpperCase()}</span>
              </div>
              <span class="flex-1 truncate">${user.name || user.email || "User"}</span>
              <svg class="h-4 w-4 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>

            <!-- User Dropdown -->
            <div id="userDropdown" class="hidden absolute bottom-full mb-2 left-0 right-0 mx-2 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10 z-50">
              <div class="p-2">
                <div class="px-3 py-2 border-b border-zinc-950/5 dark:border-white/5">
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">${user.name || user.email || "User"}</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">${user.email || ""}</p>
                </div>
                <a href="/admin/profile" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </a>
                <a href="/admin/settings" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Settings
                </a>
                <a href="/auth/logout" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      ` : ""}
    </nav>
  `;
}
var init_admin_layout_catalyst_template = __esm({
  "src/templates/layouts/admin-layout-catalyst.template.ts"() {
    init_logo_template();
  }
});

// src/templates/layouts/admin-layout-v2.template.ts
init_logo_template();
function renderAdminLayout(data) {
  const { renderAdminLayoutCatalyst: renderAdminLayoutCatalyst2 } = (init_admin_layout_catalyst_template(), __toCommonJS(admin_layout_catalyst_template_exports));
  return renderAdminLayoutCatalyst2(data);
}
function adminLayoutV2(data) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - SonicJS AI Admin</title>
  <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          backdropBlur: {
            xs: '2px',
          },
          colors: {
            primary: '#465FFF',
            secondary: '#212A3E',
            dark: '#1C1C24',
            'dark-2': '#1A1A27',
            'dark-3': '#2C2C54',
            'dark-4': '#40407A',
            'dark-5': '#706FD3',
            'gray-1': '#F7F9FC',
            'gray-2': '#E4E6EA',
            'gray-3': '#D2D4D9',
            'gray-4': '#9CA3AF',
            'gray-5': '#6B7280',
            'gray-6': '#4B5563',
            'gray-7': '#374151',
            'gray-8': '#1F2937',
            'gray-9': '#111827',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          },
          fontFamily: {
            satoshi: ['Satoshi', 'sans-serif'],
          },
          spacing: {
            '4.5': '1.125rem',
            '5.5': '1.375rem',
            '6.5': '1.625rem',
            '7.5': '1.875rem'
          },
          boxShadow: {
            'default': '0px 8px 13px -3px rgba(0, 0, 0, 0.07)',
            'card': '0px 1px 3px rgba(0, 0, 0, 0.12)',
            'card-2': '0px 1px 2px rgba(0, 0, 0, 0.05)',
            'switcher': '0px 2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 2px #FFFFFF, inset 0px -1px 1px rgba(0, 0, 0, 0.1)',
          },
          dropShadow: {
            1: '0px 1px 0px #E2E8F0',
            2: '0px 1px 4px rgba(0, 0, 0, 0.12)',
          }
        }
      }
    }
  </script>
  
  <!-- Additional Styles -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #1F2937;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #465FFF;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #3B4EE8;
    }
    
    /* Sidebar animations */
    .sidebar-item {
      transition: all 0.3s ease;
    }
    
    .sidebar-item:hover {
      transform: translateX(4px);
    }
    
    /* Card animations */
    .card-hover {
      transition: all 0.3s ease;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    /* Button gradients */
    .btn-gradient {
      background: linear-gradient(135deg, #465FFF 0%, #9333EA 100%);
    }
    
    .btn-gradient:hover {
      background: linear-gradient(135deg, #3B4EE8 0%, #7C2D12 100%);
    }
    
    /* Dark mode form elements */
    .form-input {
      background-color: #1F2937;
      border-color: #374151;
      color: #F9FAFB;
    }
    
    .form-input:focus {
      border-color: #465FFF;
      box-shadow: 0 0 0 3px rgba(70, 95, 255, 0.1);
    }
    
    /* Notification styles */
    .notification {
      animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* Custom slider styles */
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #465FFF;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #465FFF;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-webkit-slider-track {
      height: 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .slider::-moz-range-track {
      height: 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
    }
    
    /* PNG Background Images */
    .svg-pattern-blue-waves {
      background-color: #111827;
      background-image: url('/images/backgrounds/blue-waves.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .svg-pattern-blue-crescent {
      background-color: #111827;
      background-image: url('/images/backgrounds/blue-crescent.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .svg-pattern-blue-stars {
      background-color: #111827;
      background-image: url('/images/backgrounds/blue-stars.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .svg-pattern-blue-waves-3d {
      background-color: #111827;
      background-image: url('/images/backgrounds/blue-waves-3d.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  </style>
  
  <!-- Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  
  ${data.styles ? data.styles.map((style) => `<link rel="stylesheet" href="${style}">`).join("\n  ") : ""}
  ${data.scripts ? data.scripts.map((script) => `<script src="${script}"></script>`).join("\n  ") : ""}
</head>
<body class="bg-gradient-to-br from-slate-900 via-gray-900 to-black min-h-screen text-gray-1">
  <!-- Background overlay with glass effect -->
  <div id="background-overlay" class="fixed inset-0 backdrop-blur-sm" style="background-color: rgba(0, 0, 0, 0.2);"></div>
  <!-- Main container -->
  <div class="relative z-10 min-h-screen">
    <!-- Header -->
    ${renderTopBar(data.pageTitle || "Dashboard", data.user)}

    <!-- Main content area -->
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          ${renderSidebar(data.currentPath || "/", data.user, data.dynamicMenuItems)}
        </div>
        
        <!-- Main content -->
        <div class="lg:col-span-4">
          ${data.content}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Notification Container -->
  <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>
  
  <script>
    // Dark mode toggle functionality
    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    }
    
    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
    
    // Sidebar toggle for mobile
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    }
    
    // Close sidebar on overlay click
    function closeSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
    
    // User dropdown toggle
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      dropdown.classList.toggle('hidden');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('userDropdown');
      const button = event.target.closest('button');
      if (!button || !button.getAttribute('onclick')) {
        dropdown.classList.add('hidden');
      }
    });
    
    // Show notification
    function showNotification(message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      const colors = {
        success: 'bg-success text-white',
        error: 'bg-error text-white',
        warning: 'bg-warning text-white',
        info: 'bg-info text-white'
      };
      
      notification.className = \`notification px-6 py-4 rounded-lg shadow-lg \${colors[type] || colors.info} max-w-sm\`;
      notification.innerHTML = \`
        <div class="flex items-center justify-between">
          <span>\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      \`;
      
      container.appendChild(notification);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
    
    // Background customizer functionality
    function toggleBackgroundCustomizer() {
      const dropdown = document.getElementById('backgroundCustomizer');
      dropdown.classList.toggle('hidden');
    }
    
    // Background themes
    const backgroundThemes = {
      'default': 'bg-gradient-to-br from-slate-900 via-gray-900 to-black',
      'cosmic-blue': 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      'matrix-green': 'bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900',
      'cyber-pink': 'bg-gradient-to-br from-gray-900 via-pink-900 to-rose-900',
      'neon-orange': 'bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900',
      'purple-space': 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800',
      'blue-waves': 'svg-pattern-blue-waves',
      'blue-crescent': 'svg-pattern-blue-crescent',
      'blue-stars': 'svg-pattern-blue-stars',
      'blue-waves-3d': 'svg-pattern-blue-waves-3d'
    };
    
    // Set background theme
    function setBackground(theme) {
      const body = document.body;
      
      // Remove all existing background classes and SVG patterns
      Object.values(backgroundThemes).forEach(bgClass => {
        if (bgClass.startsWith('svg-pattern-')) {
          body.classList.remove(bgClass);
        } else {
          body.classList.remove(...bgClass.split(' ').slice(1)); // Remove 'bg-gradient-to-br' prefix
        }
      });
      body.classList.remove('bg-gradient-to-br');
      
      // Add new background
      const themeClass = backgroundThemes[theme];
      if (themeClass.startsWith('svg-pattern-')) {
        body.classList.add(themeClass);
      } else {
        const newClasses = themeClass.split(' ').slice(1); // Remove 'bg-gradient-to-br' prefix
        body.classList.add('bg-gradient-to-br', ...newClasses);
      }
      
      // Save preference
      localStorage.setItem('backgroundTheme', theme);
      
      // Close dropdown
      toggleBackgroundCustomizer();
      
      // Show notification
      showNotification('Background changed to ' + theme.replace('-', ' '), 'success');
    }
    
    // Adjust background darkness
    function adjustDarkness(value) {
      const overlay = document.getElementById('background-overlay');
      if (overlay) {
        const opacity = value / 100; // Convert percentage to decimal
        overlay.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
        localStorage.setItem('backgroundDarkness', value);
        console.log('Darkness adjusted to:', value + '%', 'Opacity:', opacity);
      } else {
        console.log('Overlay element not found');
      }
    }
    
    // Initialize background on page load
    function initializeBackground() {
      const savedTheme = localStorage.getItem('backgroundTheme') || 'default';
      const savedDarkness = localStorage.getItem('backgroundDarkness') || '20';
      
      // Set background theme
      if (savedTheme !== 'default') {
        const body = document.body;
        const themeClass = backgroundThemes[savedTheme];
        
        // Remove all existing backgrounds first
        Object.values(backgroundThemes).forEach(bgClass => {
          if (bgClass.startsWith('svg-pattern-')) {
            body.classList.remove(bgClass);
          } else {
            body.classList.remove(...bgClass.split(' ').slice(1));
          }
        });
        body.classList.remove('bg-gradient-to-br');
        
        // Apply saved theme
        if (themeClass.startsWith('svg-pattern-')) {
          body.classList.add(themeClass);
        } else {
          const newClasses = themeClass.split(' ').slice(1);
          body.classList.add('bg-gradient-to-br', ...newClasses);
        }
      }
      
      // Set darkness
      const overlay = document.getElementById('background-overlay');
      if (overlay) {
        const opacity = savedDarkness / 100;
        overlay.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
      }
      
      // Set slider value
      const slider = document.getElementById('darknessSlider');
      if (slider) {
        slider.value = savedDarkness;
      }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('backgroundCustomizer');
      const button = event.target.closest('button');
      const slider = event.target.closest('#darknessSlider');
      const dropdownContainer = event.target.closest('#backgroundCustomizer');
      
      // Don't close if clicking inside the dropdown, on the toggle button, or on the slider
      if (!button?.getAttribute('onclick')?.includes('toggleBackgroundCustomizer') && 
          !slider && !dropdownContainer) {
        dropdown?.classList.add('hidden');
      }
    });
    
    // Initialize background when page loads
    document.addEventListener('DOMContentLoaded', initializeBackground);
  </script>
</body>
</html>`;
}
function renderSidebar(currentPath, user, dynamicMenuItems) {
  const baseMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`
    },
    {
      label: "Content",
      path: "/admin/content",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`
    },
    {
      label: "Collections",
      path: "/admin/collections",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
      </svg>`
    },
    {
      label: "Media",
      path: "/admin/media",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
      </svg>`
    },
    {
      label: "Plugins",
      path: "/admin/plugins",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`
    },
    {
      label: "Cache",
      path: "/admin/cache",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>`
    },
    {
      label: "Design",
      path: "/admin/design",
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
      </svg>`
    },
    {
      label: "Logs",
      path: "/admin/logs",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "API Reference",
      path: "/admin/api-reference",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>`
    },
    {
      label: "Field Types",
      path: "/admin/field-types",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>`
    },
    {
      label: "API Spec",
      path: "/api",
      target: "_blank",
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>`
    }
  ];
  const allMenuItems = [...baseMenuItems];
  if (dynamicMenuItems && dynamicMenuItems.length > 0) {
    const usersIndex = allMenuItems.findIndex((item) => item.path === "/admin/users");
    if (usersIndex !== -1) {
      allMenuItems.splice(usersIndex + 1, 0, ...dynamicMenuItems);
    } else {
      allMenuItems.push(...dynamicMenuItems);
    }
  }
  return `
    <nav class="backdrop-blur-md bg-black/30 rounded-xl border border-white/10 shadow-xl p-6 h-[calc(100vh-9.5rem)] sticky top-8">
      <div class="space-y-4">
        ${allMenuItems.map((item) => {
    const isActive = currentPath === item.path || item.path !== "/admin" && currentPath.startsWith(item.path);
    const targetAttr = item.target ? ` target="${item.target}"` : "";
    return `
            <a href="${item.path}"${targetAttr} class="flex items-center space-x-3 ${isActive ? "text-white bg-white/20" : "text-gray-300 hover:text-white"} rounded-lg px-3 py-2 transition-all hover:bg-white/10">
              ${item.icon}
              <span>${item.label}</span>
            </a>
          `;
  }).join("")}
      </div>
    </nav>
  `;
}
function renderTopBar(pageTitle, user) {
  return `
    <header class="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg relative z-[9998]">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            ${renderLogo({ size: "md", showText: true, variant: "white" })}
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10 relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>

            <!-- Background Customizer -->
            <div class="relative z-[9999]">
              <button class="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10" onclick="toggleBackgroundCustomizer()">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
                </svg>
              </button>
              
              <!-- Background Customizer Dropdown -->
              <div id="backgroundCustomizer" class="hidden absolute right-0 mt-2 w-80 backdrop-blur-md bg-black/95 rounded-xl border border-white/10 shadow-xl z-[9999]">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">Background Themes</h3>
                    <button onclick="toggleBackgroundCustomizer()" class="text-gray-400 hover:text-white">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Background Options -->
                  <div class="space-y-3 mb-6">
                    <div class="grid grid-cols-2 gap-3">
                      <!-- Default (Deep Space) -->
                      <button onclick="setBackground('default')" class="bg-preview bg-gradient-to-br from-slate-900 via-gray-900 to-black h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Default</div>
                      </button>
                      
                      <!-- Cosmic Blue -->
                      <button onclick="setBackground('cosmic-blue')" class="bg-preview bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Cosmic</div>
                      </button>
                      
                      <!-- Matrix Green -->
                      <button onclick="setBackground('matrix-green')" class="bg-preview bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Matrix</div>
                      </button>
                      
                      <!-- Cyber Pink -->
                      <button onclick="setBackground('cyber-pink')" class="bg-preview bg-gradient-to-br from-gray-900 via-pink-900 to-rose-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Cyber</div>
                      </button>
                      
                      <!-- Neon Orange -->
                      <button onclick="setBackground('neon-orange')" class="bg-preview bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Neon</div>
                      </button>
                      
                      <!-- Purple Space -->
                      <button onclick="setBackground('purple-space')" class="bg-preview bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group">
                        <div class="absolute inset-0 bg-black/20 rounded-lg"></div>
                        <div class="absolute bottom-1 left-2 text-xs text-white font-medium">Purple</div>
                      </button>
                    </div>
                    
                    <!-- Custom Backgrounds -->
                    <div class="mt-4">
                      <h4 class="text-sm font-medium text-gray-300 mb-3">Custom Backgrounds</h4>
                      <div class="grid grid-cols-2 gap-3">
                        <!-- Blue Waves -->
                        <button onclick="setBackground('blue-waves')" class="h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group overflow-hidden">
                          <div class="absolute inset-0">
                            <img src="/images/backgrounds/blue-waves.png" alt="Blue Waves" class="w-full h-full object-cover opacity-60">
                          </div>
                          <div class="absolute bottom-1 left-2 text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">Waves</div>
                        </button>
                        
                        <!-- Blue Crescent -->
                        <button onclick="setBackground('blue-crescent')" class="h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group overflow-hidden">
                          <div class="absolute inset-0">
                            <img src="/images/backgrounds/blue-crescent.png" alt="Blue Crescent" class="w-full h-full object-cover opacity-60">
                          </div>
                          <div class="absolute bottom-1 left-2 text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">Crescent</div>
                        </button>
                        
                        <!-- Blue Stars -->
                        <button onclick="setBackground('blue-stars')" class="h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group overflow-hidden">
                          <div class="absolute inset-0">
                            <img src="/images/backgrounds/blue-stars.png" alt="Blue Stars" class="w-full h-full object-cover opacity-60">
                          </div>
                          <div class="absolute bottom-1 left-2 text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">Stars</div>
                        </button>
                        
                        <!-- Blue Waves 3D -->
                        <button onclick="setBackground('blue-waves-3d')" class="h-16 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all relative group overflow-hidden">
                          <div class="absolute inset-0">
                            <img src="/images/backgrounds/blue-waves-3d.png" alt="Blue Waves 3D" class="w-full h-full object-cover opacity-60">
                          </div>
                          <div class="absolute bottom-1 left-2 text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">3D Waves</div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Darkness Slider -->
                  <div class="space-y-3">
                    <label class="block text-sm font-medium text-white">Background Darkness</label>
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
                      </svg>
                      <input 
                        type="range" 
                        id="darknessSlider" 
                        min="10" 
                        max="100" 
                        value="20" 
                        class="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        oninput="adjustDarkness(this.value)"
                        onchange="adjustDarkness(this.value)"
                      >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                      </svg>
                    </div>
                    <div class="text-xs text-gray-400 text-center">Adjust overlay darkness</div>
                  </div>
                </div>
              </div>
            </div>
          
            <!-- User Dropdown -->
            ${user ? `
              <div class="relative z-[9999]">
                <button class="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors group" onclick="toggleUserDropdown()">
                  <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">${(user.name || user.email || "U").charAt(0).toUpperCase()}</span>
                  </div>
                  <div class="hidden md:block text-left">
                    <div class="text-white text-sm font-medium">${user.name || user.email || "User"}</div>
                    <div class="text-gray-400 text-xs">${user.role || "Administrator"}</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 backdrop-blur-md bg-black/95 rounded-xl border border-white/10 shadow-xl z-[9999]">
                  <div class="py-2">
                    <div class="px-4 py-2 border-b border-white/10">
                      <p class="text-sm font-medium text-gray-1">${user.name || user.email || "User"}</p>
                      <p class="text-xs text-gray-4">${user.email || ""}</p>
                    </div>
                    <a href="/admin/profile" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      My Profile
                    </a>
                    <a href="/admin/settings" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Settings
                    </a>
                    <a href="/auth/logout" class="flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign Out
                    </a>
                  </div>
                </div>
              </div>
            ` : `
              <a href="/auth/login" class="backdrop-blur-md bg-white/10 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all">
                Sign In
              </a>
            `}
        </div>
      </div>
    </header>
  `;
}

export { adminLayoutV2, init_admin_layout_catalyst_template, init_logo_template, renderAdminLayout, renderAdminLayoutCatalyst, renderLogo };
//# sourceMappingURL=chunk-G4JGVZAF.js.map
//# sourceMappingURL=chunk-G4JGVZAF.js.map