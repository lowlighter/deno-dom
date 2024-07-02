import { CTOR_KEY } from "../constructor-lock.ts";
import type { HTMLElement } from "./elements/html-element.ts";
import type { Node } from "./node.ts";
import type { Window } from "./window.ts";

export interface CustomElementConstructor {
  // deno-lint-ignore no-explicit-any
  new (...params: any[]): HTMLElement;

  connectedCallback?: () => void;
  disconnectedCallback?: () => void;

  // TODO: implement properties below
  // adoptedCallback?:() => void
  // attributeChangedCallback?:(name:string, oldValue:string, newValue:string) => void
  // observedAttributes?:Readonly<string[]>
}

export interface ElementDefinitionOptions {
  extends?: string;
}

export class CustomElementRegistry {
  constructor(window?: Window, key?: typeof CTOR_KEY) {
    if ((key !== CTOR_KEY) || (!window)) {
      throw new TypeError("Illegal constructor");
    }
    this.#window = window;
  }

  readonly #window;

  readonly #registry = new Map<string, CustomElementConstructor>();

  readonly #promised = new Map<
    string,
    {
      promise: Promise<CustomElementConstructor>;
      resolve: (
        value: CustomElementConstructor | PromiseLike<CustomElementConstructor>,
      ) => void;
    }
  >();

  #validName(name: string) {
    if (
      /^annotation-xml|color-profile|missing-glyph|(?:font-face(?:-(?:src|uri|format|name))?)$/
        .test(name)
    ) {
      return false;
    }
    return /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(name);
  }

  define(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
  ) {
    if (!constructor?.prototype) {
      throw new TypeError("Argument 2 must be a constructor");
    }
    if (!this.#validName(name)) {
      throw new DOMException(
        `'${name}' is not a valid custom element name`,
        "SyntaxError",
      );
    }
    const defined = [...this.#registry];
    const definedName = defined.find(([k, _v]) => k === name);
    const definedConstructor = defined.find(([_k, v]) => v === constructor);
    if (definedName) {
      throw new DOMException(
        `'${name}' has already been defined as a custom element`,
        "NotSupportedError",
      );
    }
    if (definedConstructor) {
      throw new DOMException(
        `'${name}' and '${definedConstructor}' have the same constructor`,
        "NotSupportedError",
      );
    }
    if (options?.extends) {
      if (this.#validName(options.extends)) {
        throw new DOMException(
          `'${name}' cannot extend a custom element`,
          "NotSupportedError",
        );
      }
    }
    // TODO: implement disabledFeatures and formAssociated
    this.#registry.set(name, constructor);
    this.upgrade(this.#window.document);
    this.whenDefined(name);
    this.#promised.get(name)!.resolve(constructor);
  }

  get(name: string) {
    return this.#registry.get(name);
  }

  getName(constructor: CustomElementConstructor) {
    return Array.from(this.#registry.entries()).find(([_, value]) =>
      value === constructor
    )?.[0] ?? null;
  }

  whenDefined(name: string) {
    if (!this.#validName(name)) {
      throw new DOMException(
        `'${name}' is not a valid custom element name`,
        "SyntaxError",
      );
    }
    if (!this.#promised.has(name)) {
      const { promise, resolve } = Promise.withResolvers<
        CustomElementConstructor
      >();
      this.#promised.set(name, { promise, resolve });
    }
    return this.#promised.get(name)!.promise;
  }

  upgrade(node: Node) {
    // TODO: implement attributeChangedCallback
    return;
  }
}
