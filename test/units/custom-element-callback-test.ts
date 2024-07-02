import "../../deno-dom-wasm.ts";
import { HTMLElement } from "../../src/dom/elements/html-element.ts";
import { CTOR_KEY } from "../../src/constructor-lock.ts";
import {
  type CustomElementConstructor,
  CustomElementRegistry,
} from "../../src/dom/custom-element-registry.ts";
import { assertInstanceOf, assertStrictEquals, assertThrows } from "assert";
import { expect, fn } from "expect";
import { Window } from "../../src/dom/window.ts";
import { DOMParser } from "../../deno-dom-wasm.ts";

const doc = new DOMParser().parseFromString("", "text/html");
const window = new Window(doc);

Deno.test("CustomElementRegistry.define defines new custom elements", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  const connectedFn = fn();
  const xcustom = class extends HTMLElement
    implements CustomElementConstructor {
    connectedCallback() {
      connectedFn();
    }
    disconnectedCallback() {
    }
  };

  reg.define("x-custom", xcustom);
  assertStrictEquals(reg.get("x-custom"), xcustom);
});
