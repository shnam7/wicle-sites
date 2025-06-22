---
layout: ../layouts/DefaultLayout.astro

title: Getting Started
frontpage: true
bodyClass: 'front-page'
---

# Introduction

Wicle is a modular component library for web front-end development. It provides a collection of web components in scss and typescript modules.

# Installation

```sh
npm i wicle --save-dev
```

# How to use

## Using scss

First create a configuration file for your site, like this:

```scss
// file: _site.config.scss

@import 'wdk'; // Make WDK constants and tools available

//--- Define site-wide variables
// $site-page-width: 960px;

//--- Theme Configuration
// select one of Wicle predefined themes
// @import "wicle/themes/amaranth";
// @import "wicle/themes/harley-davison-orange";
// @import "wicle/themes/purple";
// @import "wicle/themes/teal";

// Or, define custom theme
// $w-theme-color:           $w-color-amaranth;

//-----------------------------------------------
//  Wicle custom config
//-----------------------------------------------
$w-font-size: 15px;
$w-page-max-width: 1220px;

// use mixin to avoid unnecessaty global variable definition($key)
@mixin wicle-custom-config {
    //--- navbar
    $key: 'w-navbar';
    @include ssv($key, 'brand/font-family', $w-font-roboto, true);

    //--- layout
    $key: 'w-layout';
    @include ssv($key, 'page/font-family', $w-font-roboto, true);
}
@include wicle-custom-config();

//--- Finally, include Wicle config
@import 'wicle.config';
```

Now, create site style file, including the configuration.

```scss
// file: my-site-styles.scss:

// Include the configuration file, so that it takes precedence. And then, include Wicle.
@import 'site.config';
@import 'wicle'; // import Wicle components

//--- Enable Wicle optional features if necessary (optional class generation)
@include w-button-modifier-color-scheme();
@include w-panel-modifier-color-scheme();

// Now you are ready to add your own styles from here.
// ...
```

## Using typescript

Some wicle module requires javascript support and you need to load wicle.min.js from your browser.
Wicle scripts are witten in typescript and currently compiled in 'system' module format.
So, you need to load it using systemjs module unless you use separate bundling tools.

Basic configuration will look like this:

```html
<html>
    <head>
        ...
    </head>
    <body>
        ...
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/5.0.0/system.min.js"
            integrity="sha256-uXkS+U7CJO4fEqwnS4RCDBZMl49PgoKj/+CuV+ZT9TU="
            crossorigin="anonymous"></script>
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/5.0.0/extras/named-register.min.js"
            integrity="sha256-Vuh3TczExPMAVhPsR3+vaqgN90hBtLgOUSU8m4gL0GQ="
            crossorigin="anonymous"></script>
        <script src="/js/boot.js"></script>
    </body>
</html>
```

```js
/** main.ts - application main script */
import {offcanvas} from 'wicle/ui/offcanvas'
import {nav} from 'wicle/ui/nav'

offcanvas()
nav()
```

```json
/** tsconfig.json - Typescript configuration */
{
    "compilerOptions": {
        "target": "es5",
        "module": "system", // select 'system' format
        "declaration": false,
        "noImplicitAny": true,
        "noEmitOnError": true,
        "lib": ["dom", "es6", "dom.iterable", "scripthost"],

        // add path to search for 'wicle.d.ts'
        "baseUrl": ".",
        "paths": {
            // relative to baseUrl
            "*": ["*", "node_modules/wicle/js/*"]
        }
    }
}
```

```js
/** boot.js - load javascript using systemjs loader */
baseUrl = '/js/'
System.import(baseUrl + 'wicle.min.js').then(() => {
    System.import(baseUrl + 'main.js')
})
```
