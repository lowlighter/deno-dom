import { CTOR_KEY } from "../constructor-lock.ts";
import { CustomElementRegistry } from "./custom-element-registry.ts";
import type { Document } from "./document.ts";

export class Window extends EventTarget {
  #customElements: CustomElementRegistry;
  #document: Document;

  constructor(document?: Document, key?: typeof CTOR_KEY) {
    super();
    if ((key !== CTOR_KEY) || (!document)) {
      throw new TypeError("Illegal constructor");
    }
    this.#document = document;
    this.#customElements = new CustomElementRegistry(this, CTOR_KEY);
  }

  get document(): Document {
    return this.#document;
  }

  get customElements(): CustomElementRegistry {
    return this.#customElements;
  }
}
