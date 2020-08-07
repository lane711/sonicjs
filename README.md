<a href="https://circleci.com/gh/lane711/sonicjs">
        <img src="https://circleci.com/gh/lane711/sonicjs.svg?style=svg" alt="Build Status" />
    </a>

<a href="https://github.com/lane711/sonicjs/releases">
        <img src="https://img.shields.io/github/package-json/v/lane711/sonicjs" alt="Latest release" />
    </a>

  <a href="https://www.paypal.me/sonicjs">
      <img src="https://img.shields.io/badge/Donate-PayPal-green.svg" alt="Donate" />
  </a>

### If you find the project promising:

### :star: PLEASE STAR THIS PROJECT :star: !!! :)

### It will help spread the word so that I can start to generate developer feedback. Thanks in advance!

![Image of SonicJs Logo](https://sonicjs.com/api/containers/files/download/sonicjs-logo-dark.svg)
[https://sonicjs.com](https://sonicjs.com)

# SonicJS is a Modern Open Source "Free Forever" NodeJs Based Content Management System

## Screen Shots

<table>
  <tr>
    <td>Manage Content Types</td>
     <td>Drag and Drop Form Builder</td>
     <td>Edit Content with Automagically Generated Forms</td>
  </tr>
  <tr>
    <td><img src="https://sonicjs.com/images/Node.js CMS - Content Type Edit.png?width=600" width="300px" alt="Manage Content Types" /></td>
    <td><img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Content%20Type%20Edit.png?width=600" width="300px" alt="Drag and Drop Form Builder" /></td>
    <td><img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Edit%20Content.png?width=600" width="300px" alt="Edit Content with Automagically Generated Forms" /></td>
  </tr>
    <tr>
    <td>Build Advanced Forms with over 20 Field Types</td>
     <td>Edit Content Properties From the Front End</td>
     <td>Front End WYSIWYG Editor</td>
  </tr>
  <tr>
    <td><img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Content%20Type%20Edit.png?width=600" width="300px" alt="Drag and Drop Form Builder" /></td>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Front%20End%20Page%20Settings.png?width=600" width="300px" alt="Front End Content Editing" /></td>
    <td><img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Front%20End%20WYSIWYG%20Editor.png?width=600" width="300px" alt="Front End WYSIWYG Editor" /></td>
  </tr>
      <tr>
    <td>Menu Manager</td>
     <td>Real Time CSS Editor</td>
     <td>Built In Media Server</td>
  </tr>
  <tr>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Menu%20Management.png?width=600" width="300px" alt="Menu Manager" /></td>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Front%20End%20CSS%20Editing.png?width=600" width="300px" alt="Real Time CSS Editor" /></td>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Media%20Manager.png?width=600" width="300px" alt="Built In Media Server" /></td>
  </tr>
        <tr>
    <td>Module Management</td>
     <td>Front End Json Editor</td>
     <td>Swagger API Explorer</td>
  </tr>
  <tr>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Module%20Management.png?width=600" width="300px" alt="Module Management" /></td>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20Front%20End%20Json%20Editor.png?width=600" width="300px" alt="Front End Json Editor" /></td>
    <td>    <img src="https://sonicjs.com/images/Node.js%20CMS%20-%20API%20Explorer.png?width=600" width="300px" alt="Swagger API Explorer" /></td>
  </tr>
 </table>

## Visit https://sonicjs.com for Details, Videos & Docs

# SonicJs NodeJs Content Management System (CMS)

## Overview

### SonicJs is a 100% javascript based, REST API driven CMS/Framework built on the following tech stack:

- NodeJs
- Express
- Bootstrap 4

### SonicJs supports many common databases including:

- MongoDB, MySQL, SQL Server, Cloudant, DashDB, DB2, Informix, Oracle, PostgreSQL, Redis, SQLite3, Flat File (Json), In-Memory

### Why SonicJs?

There are thousands of CMS out there and several already built on the modern JAM stack (JavaScript, API & Markup). I was looking for a solid Node.js based CMS suitable as a foundation for enterprise application development. It didn't exist. For a detailed description of why SonicJs was started, please see the <a href="https://sonicjs.com/about">about page</a>.

## Table of Contents

1. [Getting Started](#getting-started)
1. [Quick Intro](#quick-intro)
1. [Free Forever](#free-forever)
1. [Goals, Motivation And Principals](#goals-motivation-and-principals)
1. [Support](#support)
1. [Contributing - Get Involved!](#contributing---get-involved)
1. [Deployment](#deployment)
1. [Examples](#examples)
1. [Versioning](#versioning)
1. [Authors](#authors)
1. [License](#license)
1. [Acknowledgments](#acknowledgments)
1. [Video Overview + Demo](#video-overview--demo)

## Getting Started

### Pre-requisites

You just need NodeJs installed. No other setup is needed.

### Setup Steps

When you first setup SonicJs locally, the default database is set to use the Flat File (Json) database. This can be used throughout your development process and even in production for sites that are primarily read-heavy.

Follow these steps and you should be good to go:

1. Clone the repo: `git clone https://github.com/lane711/sonicjs.git`
1. Change to created folder `cd sonicjs`
1. Install the dependencies: `npm install`
1. Run the setup script to install the database: `npm run setup` and follow the prompts
1. Run it with: `npm start`

You should see the following message in your console:

- Website at: http://localhost:3018
- Admin console at: http://localhost:3018/admin
- REST API at: http://localhost:3018/explorer

## A Quick Intro to SonicJs

SonicJs is similar to Drupal CMS in that it is highly configurable. You can build your own content types using a drag and drop style form editor. All basic CRUD operations are generated on the fly by the framework. Unlike other NodeJs CMS', such as KeystoneJs, SonicJs does not generate code (a good thing!). It has a very powerful runtime engine that is built with both performance and flexibility in mind.

SonicJs can handle most common website building use-cases with ease, but it also positioned to be an enterprise application framework/platform enabling developers to start custom web application projects with a solid foundation. This can help significantly reduce the overall effort required for your project.

SonicJs is also 100% REST API based and therefor a great choice if you are looking for a **Headless CMS** for your mobile app or IoT project. All of the content types that you create in the admin interface are instantly exposed as REST end points. There is no need to restart the application as required in other NodeJs based Headless CMS.

SonicJs is built with love from Orange County California.

## Free Forever

If you are considering using SonicJs for your next web project, its important to know that it shall remain free forever (again similar to Drupal). Be wary of other "free" Node.js open source CMS solutions being built by start-ups or established companies that haven't made this same "free forever" commitment.

If you are interested in reading more about me or the goals and motivation of the project, please check out the "about" page here: https://sonicjs.com/about.

Also, if you've actually read down this far and happen to be a in generous mood, :star::star::star::star::star: **would you mind given the project a star?**:star::star::star::star::star: Thanks in advance!

## Debugging

1. From Visual Studio Code, make sure the standard debugger for Chrome extension is installed.
1. Hit "Play"

## Goals, Motivation And Principals

Please see here for a full explanation: https://sonicjs.com/about, however here is a high level list of SonicJs' guiding principals:

- Why Did I Start SonicJs?
- So is SonicJs just a Node.js based clone of Drupal?
- Free Forever
- One Module per Feature
- UI/UX Continuity
- Hooks/ the Event Emitter Pattern
- Light Weight Core
- Extensibility
- Convention over Configuration
- Minimal Learning Curve
- KISS
- Do it Right the First Time
- 100% REST Based
- No "Fighting"
- Development Should be Fun

## Support

Please feel free to create an issue here in github or email me using the contact form [here](https://sonicjs.com/contact). I'll make every attempt to get back to you quickly and help answers and questions you may have.

## Contributing - Get Involved!

Interested in contributing to SonicJs? Any and all help is welcome! Please read [CONTRIBUTING.md](https://github.com/lane711/sonicjs/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Deployment

Deployment is basically the same as any regular Node.js/Express project. The project has successfully been deployed to Heroku, NodeChef, Amazon EC2 and others. I recommend using a process manager like PM2 or similar if you are deploying on a self managed server (like EC2).

## Examples

Presently, the only in-production implementations that I know about (aside from sonicjs.com) are internal company applications. If you have an example you'd like to share, please contact me [here.](https://sonicjs.com/contact) and I'll be happy to list it here.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/lane711/sonicjs/tags).

## Authors

- **Lane Campbell** - _Initial work_ - [SonicJs](https://sonicjs.com)
- **[Your name here]** - _Future SonicJs Core Developer_ - [SonicJs](https://sonicjs.com)

See also the list of [contributors](https://github.com/lane711/sonicjs/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/lane711/sonicjs/blob/master/LICENSE) file for details

## Acknowledgments

SonicJs is written entirely in Javascript. It uses a number of open source tools, utilities, etc but there are a few of them that I wanted to make special mention of:

1. Loopback - An awesome NodeJs based ORM helping to support much of the heavy lifting in SonicJs' data tier.
1. CoreUI - a truly great open source admin theme.
1. Formio - a rock solid form builder with loads of advanced functionality.

## Video Overview + Demo

See here for several videos to get you up and running quickly. [Overview and Demo Videos](https://sonicjs.com/docs)
