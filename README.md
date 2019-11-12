
![Image of SonicJs Logo](https://sonicjs.com/api/containers/files/download/sonicjs-logo.svg)
[https://sonicjs.com](https://sonicjs.com)

# SonicJS is a Modern Open Source NodeJs Based Content Management System

![SonicJs Nodejs CMS Admin Dashboard](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Dashboard.png)

## Visit https://sonicjs.com for Details, Videos & Docs

# SonicJs NodeJs Content Management System (CMS)

## Overview

### SonicJs is 100% javascript based and completely REST API driven CMS built on the following tech stack:

- NodeJs
- Express
- Bootstrap 4

### SonicJs supports many common databases including: 
- MongoDB
- MySQL
- SQL Server
- Cloudant
- DashDB 
- DB2
- Informix
- Oracle
- PostgreSQL
- Redis
- SQLite3
- Flat File (Json)
- In-Memory

## Table of Contents

1. [Getting Started](#getting-started)
1. [Screen Shots](#screen-shots)
1. [Project Status](#project-status)
1. [Goals And Motivation](#goals-and-motivation)
1. [Setup](#setup)
1. [Sponsers](#sponsers)

## Getting Started

### Pre-requisits
You just need NodeJs installed. No other setup is needed.

### Setup Steps

When you first setup SonicJs locally, the default database is set to use the Flat File (Json) database. This can be used throughout your development process and even in production for site that are mainly read-heavy.

Follow these steps and you should be go to go:

1. Clone the repo: `git clone https://github.com/lane711/sonicjs.git`
1. Install the dependencies: `npm install`
1. Run it: `npm start`

You should see the following message in your console:
- Website at:  http://localhost:3018
- Admin console at:  http://localhost:3018/admin
- REST API at:  http://localhost:3018/explorer


## A Quick Intro to SonicJs
SonicJs is similar to Drupal CMS in that it is highly configurable. You can build your own content types using a drag and drop style form editor. All basic CRUD operations are generated on the fly by the framework. Unlike other NodeJs CMS', such as KeystoneJs, SonicJs does not generate code (a good thing!). It has a very powerful runtime engine that is built with both performance and flexbility in mind.

SonicJs can handle most common website building use-cases with ease, but it also positioned to be an enterprise application framework/platform enabling developers to start custom web application projects with a solid foundation. This can help significantly reduce the overall effort required for your project.

SonicJs is also 100% REST API based and therefor a great choice if you are looking for a **Headless CMS**. All of the content types that you create in the admin interface are instantly exposted as REST end points. There is no need to restart the application as required in other NodeJs based Headless CMS like Strapi or Butter CMS.

SonicJs is built with love from Orange County California.

## Free Forever
If you are considering using SonicJs for your next web project, its important to know that it shall remain free forever. If you are interested in reading more about me or the goals and motivation of the project, please check out the "about" page here: https://sonicjs.com/about

## Screen Shots

Manage Content Types:

![Manage Content Types](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Content%20Types.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Content%20Type%20Edit.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Edit%20Content.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Field%20Types.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Front%20End%20Page%20Settings.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Front%20End%20WYSIWYG%20Editor.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Menu%20Management.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Front%20End%20CSS%20Editing.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Media%20Manager.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Module%20Management.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Front%20End%20Json%20Editor.png)

![](https://sonicjs.com/api/containers/files/download/NodeJS%20CMS%20-%20API%20Explorer.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS-%20API%20Data%20Explorer.png)

![](https://sonicjs.com/api/containers/files/download/NodeJs%20CMS%20-%20Back%20End%20Login.png
)
Adding a Field to a Content Type:

![Add Field to Content Type](https://kevant.com/siteden/add-fields-to-content-type.png)

Creating a Blog Post (Form is auto-generated):

![Add Field to Content Type](https://kevant.com/siteden/create-blog-post.png)

Manage Field Types:

![Manage Field Types](https://kevant.com/siteden/field-types.png)

## Project Status

Overall, the project is in an **early POC and Planning Phase**. Below is a list of features and their associated status. The features in the "Complete" section indicate parts of the application that have reached the initial POC stage. **This project should not be used in a production setting.**

**The actual front end website generated by the back-end is currently a work-in-progress**

**Complete Features**:

- Serve dynamic data-driven content
- Create custom content types (ie: Pages, Menus, Blog Posts, Books, Movies, etc)
- Create custom field types to be used as the building blocks for content types (ie: Textbox, Select List, Tags, Layout, etc)
- Create content, each instance with it's own unique URL
- Bootstrap 4 based admin theme
- Bootstrap 4 based front end theme

**Planned Features**:

- Security (User managements, roles, login, registration, etc)
- Themes, ability to switch front end theme
- Theme Library, collection of pre-built front end theme
- Modules, extend capabilities AND extend/override core functionality

## Goals And Motivation

In short, the goal of this project is to create a NodeJs based CMS with the flexibility of Drupal and the front end editing capabilities of some of Wordpress' top page builder plugins.

The audience for this CMS project in order of precedence are:

1. Web Developers
1. Web Designers
1. Site Builders (Non-technical)

Ultimately this project will allow developers to build complex web applications, not just websites with the goal of cutting down development time by providing basic core functionality similar on most web application projects.

Modules can be built (using NodeJs) or added from the community repository. This allows the system to be extended not only in meeting custom requirements but also the alteration of core functionality (Similar to Drupal).

I started this project because I have established a recent affinity to NodeJs although I'm primarily a Asp.Net/C#/SQL Server developer by day. There wasn't an existing NodeJs CMS project with lofty enough goals to perhaps someday become a highly trusted web application platform/CMS.

## Quickstart Setup

1. Clone this repo `git clone https://github.com/lane711/sonicjs.git`
1. Install dependencies with `npm install`
1. To run the app: `npm start`

Note: you don't need to use any database for local development, Loopback is configured to use a file based database (just json files).

## Debugging

1. From VS Code, install the standard debugger for Chrome extension 
1. Hit "Play"

## Automated Browser Testing
`node e2e/content-types.ts`

## Sponsors

This Project is supported by [Surge](https://www.surgeforward.com/)
