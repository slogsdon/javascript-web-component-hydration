// @ts-check

import { hydrate } from "./helpers.js";

/**
 * Requires a `template` element to be present on page with the custom element's
 * client-side template. The `template` element should have an `id` of the custom
 * element's name prefixed with `template-`, e.g. `template-my-custom-element`.
 */
export class CustomHTMLElement extends HTMLElement {
  /**
   * Custom element's name
   * @type {string | undefined}
   */
  static get is() { return undefined; }

  /**
   * Ensures custom elements are only defined once per page load and pass along
   * the promise created with `customElements.whenDefined`.
   *
   * A rejected promise is returned when the custom element's name is not defined
   * via `is` or when custom elements are not available for the current browser.
   */
  static async register() {
    if (this.is === undefined) {
      throw new Error('No defined name');
    }

    if (!window.customElements) {
      throw new Error('window.customElements not available');
    }

    const elementName = this.is;
    const promise = window.customElements.whenDefined(elementName);
    const isDefined = window.customElements.get(elementName) !== undefined;

    if (!isDefined) {
      window.customElements.define(elementName, this);
    }

    return promise;
  }

  constructor() {
      super();

      /** @type {HTMLTemplateElement} */
      // @ts-ignore
      this.template = document.getElementById(`template-${this.constructor.is}`);
      this.attachShadow({ mode: 'open' });

      /** @type {string[]} */
      this.knownCustomElements = [];
  }

  /**
   * When extending `CustomHTMLElement` and defining your own `connectedCallback`,
   * be sure to call `super.connectedCallback()`  to support hydration of child
   * elements in both the regular and shadow DOMs.
   */
  connectedCallback() {
    if (!this.shadowRoot || !this.isConnected || !this.template) {
      return;
    }

    this.shadowRoot.appendChild(
      this.template.content.cloneNode(true),
    );

    [
      ...this.querySelectorAll('[data-template]'),
      ...this.shadowRoot.querySelectorAll('[data-template]'),
    ]
      .forEach(this.hydrateSubComponents.bind(this));
  }

  /**
   * @param {Element} el
   */
  hydrateSubComponents(el) {
    const name = el.getAttribute('data-template');

    // skip if missing element name or already hydrated elements
    if (!name || this.knownCustomElements.indexOf(name) !== -1) {
      return;
    }

    this.knownCustomElements.push(name);
    hydrate(name);
  }
}
