---
layout: ../layouts/DefaultLayout.astro

title: Getting Started
frontpage: true
bodyClass: 'front-page'
---

# Introduction

Wicle for Sites is a modular component library for web front-end development.

# Installation

```sh
npm i wicle-sites --save-dev
```

# How to use

## Using scss

First create a configuration file for your site:

file: ./\_app.scss

```scss
// @use 'wdk/app';
// @use 'wdk/color';
@use 'wdk/ui/media-query' as mq;
@use 'wicle';
@use 'wicle/layout/site';
@use 'wicle/components/search';

//----------------------------------------------------------
//  Wicle Configuration
//-------------------------------------------------------------
@include site.ssv('banner/min-height', 25rem);
@include mq.set-breakpoints(mq.$w-breakpoints-tailwind);

.demo-header {
    display: flex;
    justify-content: right;
    margin: 0.5rem 0;
}

// call wicle.init() in the last to have computed config
// values from the above  custom configurations

@include wicle.init();

//---------------------------------------------------------
//  App-leve custom configuration
//---------------------------------------------------------
@include app.ssv('custom/var/name', 123, true);

//---------------------------------------------------------
// Generate Wicle styles
//---------------------------------------------------------
@include wicle.generate();
```

## Using typescript

Some module requires javascript.

Basic configuration will look like this

```ts
/** main.ts - application main script */
import {offcanvas} from 'wicle/ui/offcanvas'
import {nav} from 'wicle/ui/nav'

offcanvas()
nav()
```
