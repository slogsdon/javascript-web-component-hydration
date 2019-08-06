# web-component-hydration

> Thin wrapper around HTMLElement to support hydration of server-side rendered custom elements

### Features

- Plain JavaScript
- Native [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- Minimal dependencies

### Reasoning

JavaScript is readily available and flexible. Modern browser JavaScript is more than capable.

This project also scratches an itch to see how much JavaScript and non-Node.js server environments can work together to handle this problem domain.

## Client-Side Components

Let's dive in quickly to see how the client-side JavaScript looks:

```javascript
// x-list-item.js
import { CustomHTMLElement } from './node_modules/web-component-hydration/custom-html-element.js';

export class XListItem extends CustomHTMLElement {
  // define `XListItem`'s tag name
  static get is() { return 'x-list-item'; }
}
```

```javascript
// main.js
import { hydrate } from './node_modules/web-component-hydration/helpers.js';
import { XListItem } from './x-list-item.js';

// register `XListItem` as a custom element
await XListItem.register();
// hydrate any server-side rendered `XListIem`s
hydrate(XListItem.is);
```

A couple of key points:

- **`CustomHTMLElement.is`** defines the element's tag name
- **`CustomHTMLElement.register`** ensures an element is able to be defined and is only defined once
- **`hydrate`** operates on all server-side rendered elements with a given tag name and is called internally by `CustomHTMLElement.connectedCallback` to hydrate children

## Server-Side Rendering

This library is meant to be paired with a service to render custom elements / web components on the server. If a libary for your preferred language isn't available, most languages have support built-in or via third-party packages to convert custom element templates and some data to static HTML.

Example template for the `x-list-item` custom element:

```html
<template id="template-x-list-item">
  <li>
    <slot></slot>
  </li>
</template>
```

Rendered HTML with data `content`:

```html
<div data-template="x-list-item" data-initial-data="content">
  <li>
    <slot>content</slot>
  </li>
</div>
```

A few things to notice:

- The data (`content`) is set as the `data-initial-data` attribute's value and inserted into the unnamed slot as a child
- The custom element name (`x-list-item`) is set as the `data-template` attribute's value

This `data-template` attribute matches the `template` via `id="template-x-list"`, allowing the client library to know which template to use during hydration.

### Named Slots

Using named slots in the custom element's template requires a couple of small changes when compared to the single unnamed slot:

- Slots should be named, and named slots should not be mixed with unnamed slots. These should match browser specs
- `data-initial-data` should be JSON-encoded key/value pairs for each of the named slots

As an example:

```html
<template id="template-x-list-item">
  <li>
    <slot name="label"></slot>
    <slot name="foo"></slot>
  </li>
</template>
```

Rendered HTML with data `content`:

```html
<div data-template="x-list-item" data-initial-data="{\"label\":\"content\",\"foo\":\"bar\"}">
  <li>
    <slot name="label">content</slot>
    <slot name="foo">bar</slot>
  </li>
</div>
```

### Known Implementations

- [PHP](https://packagist.org/packages/slogsdon/web-component-ssr)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
