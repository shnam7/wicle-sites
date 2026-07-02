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

## Using SCSS

Wicle provides SCSS modules you can `@use` selectively. A typical setup:

file: ./app.scss

```scss
@use 'wdk/ui/media-query' as mq;
@use 'wicle';
@use 'wicle/layout/site';
@use 'wicle/components/search';

//----------------------------------------------------------
//  Wicle Configuration
//----------------------------------------------------------
@include site.ssv('banner/min-height', 25rem);
@include mq.set-breakpoints(mq.$w-breakpoints-tailwind);

//---------------------------------------------------------
// Generate Wicle styles
//---------------------------------------------------------
@include wicle.generate();
```

`wicle.generate()` renders all styles for every included component. You can also import components individually instead of the root `wicle` module:

```scss
@use 'wicle/base/reset';
@use 'wicle/base/typography';
@use 'wicle/components/nav';
@use 'wicle/components/button';
@use 'wicle/layout/site';
@use 'wicle/layout/page';

@include reset.generate;
@include typography.generate;
@include nav.generate;
@include button.generate;
@include site.generate;
@include page.generate;
```

### Available SCSS modules

| Module                        | Description                           |
| ----------------------------- | ------------------------------------- |
| `wicle`                       | Root module — includes all components |
| `wicle/base/reset`            | CSS reset                             |
| `wicle/base/typography`       | Typography defaults                   |
| `wicle/components/button`     | Button styles                         |
| `wicle/components/divider`    | Divider styles                        |
| `wicle/components/image`      | Image utilities                       |
| `wicle/components/nav`        | Navigation                            |
| `wicle/components/navbar`     | Navbar                                |
| `wicle/components/pagination` | Pagination                            |
| `wicle/components/panel`      | Panel / card                          |
| `wicle/components/scrollbar`  | Custom scrollbar                      |
| `wicle/components/search`     | Search box                            |
| `wicle/layout/site`           | Site layout (header, banner, footer)  |
| `wicle/layout/page`           | Page layout                           |
| `wicle/themes/teal`           | Teal color theme                      |
| `wicle/themes/amaranth`       | Amaranth color theme                  |
| `wicle/themes/purple`         | Purple color theme                    |

## Using TypeScript

Some components require JavaScript. Import from the `wicle-sites` package entry point:

```ts
/** main.ts - application main script */
import {nav, offcanvas} from 'wicle-sites'

nav()
offcanvas()
```

### Media query change detection

```ts
import {mqStart, type MediaQueryState} from 'wicle-sites'

// Start with default tailwind breakpoints
mqStart()

// Or pass custom breakpoints
import {breakPointsReg} from 'wicle-sites'
mqStart(breakPointsReg.bootStrap)

// Listen for breakpoint changes
window.addEventListener('mq:change', e => {
    const {state, width, prevState, prevWidth} = (e as CustomEvent<MediaQueryState>).detail
    console.log(`${prevState} → ${state} (${width}px)`)
})
```

### Available exports

| Export                            | Description                                                           |
| --------------------------------- | --------------------------------------------------------------------- |
| `nav(options?)`                   | Initialize navigation component                                       |
| `offcanvas(options?)`             | Initialize offcanvas component                                        |
| `mqStart(breakPoints?, options?)` | Start media query change detection                                    |
| `breakPointsReg`                  | Predefined breakpoint sets (`tailwind`, `bootStrap`, `foundation`, …) |
| `Parallax`                        | Parallax scrolling (`Parallax.Container`, `Parallax.Surface`)         |
| `getViewportSize()`               | Returns current viewport `{width, height}`                            |
