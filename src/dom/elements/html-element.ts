import { Element } from "../element.ts";
import type { Document } from "../document.ts";
import type { CustomElementConstructor } from "../custom-element-registry.ts";

export class HTMLElement extends Element {
  _setOwnerDocument(document: Document | null) {
    const previous = this.ownerDocument;
    const changed = super._setOwnerDocument(document);
    if (changed) {
      const custom = this as unknown as CustomElementConstructor;
      if (previous?.defaultView?.customElements?.get(this.tagName)) {
        custom.disconnectedCallback?.();
      }
      if (document?.defaultView?.customElements?.get(this.tagName)) {
        custom.connectedCallback?.();
      }
    }
    return changed;
  }
}
