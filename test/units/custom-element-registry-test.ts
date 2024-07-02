import "../../deno-dom-wasm.ts";
import { HTMLElement } from "../../src/dom/elements/html-element.ts";
import { CTOR_KEY } from "../../src/constructor-lock.ts";
import { CustomElementRegistry } from "../../src/dom/custom-element-registry.ts";
import { assertInstanceOf, assertStrictEquals, assertThrows } from "assert";
import { Window } from "../../src/dom/window.ts";
import { DOMParser } from "../../deno-dom-wasm.ts";

const doc = new DOMParser().parseFromString("", "text/html");
const window = new Window(doc);

const xcustom = class extends HTMLElement {};

Deno.test("CustomElementRegistry is an illegal constructor", () => {
  assertThrows(() => new CustomElementRegistry());
});

Deno.test("CustomElementRegistry.define defines new custom elements", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  reg.define("x-custom", xcustom);
  assertStrictEquals(reg.get("x-custom"), xcustom);
});

Deno.test("CustomElementRegistry.define throws on invalid constructor", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  // deno-lint-ignore no-explicit-any
  assertThrows(
    () => reg.define("x-custom", null as any),
    "must be a constructor",
  );
});

Deno.test("CustomElementRegistry.define throws on invalid custom element name", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  assertThrows(
    () => reg.define("missing-glyph", xcustom),
    "not a valid custom element name",
  );
});

Deno.test("CustomElementRegistry.define throws on already defined custom element name", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  reg.define("x-custom", xcustom);
  assertThrows(
    () => reg.define("x-custom", xcustom),
    "has already been defined",
  );
});

Deno.test("CustomElementRegistry.define throws on already defined custom element constructor", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  reg.define("x-custom", xcustom);
  assertThrows(
    () => reg.define("x-custom-2", xcustom),
    "have the same constructor",
  );
});

Deno.test("CustomElementRegistry.define throws on trying to extends custom element", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  assertThrows(
    () => reg.define("x-extends", xcustom, { extends: "x-custom" }),
    "cannot extend a custom element",
  );
});

Deno.test("CustomElementRegistry.whenDefine returns a promise that resolves once the custom element is defined", async () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  const promise = reg.whenDefined("x-custom");
  assertInstanceOf(promise, Promise);
  reg.define("x-custom", xcustom);
  assertStrictEquals(await promise, xcustom);
  assertStrictEquals(await reg.whenDefined("x-custom"), xcustom);
});

Deno.test("CustomElementRegistry.whenDefine throws on invalid custom element name", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  assertThrows(
    () => reg.whenDefined("missing-glyph"),
    "not a valid custom element name",
  );
});

Deno.test("CustomElementRegistry.get returns a custom element from registry", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  assertStrictEquals(reg.get("x-custom"), undefined);
  reg.define("x-custom", xcustom);
  assertStrictEquals(reg.get("x-custom"), xcustom);
});

Deno.test("CustomElementRegistry.getName returns a custom element name from registry", () => {
  const reg = new CustomElementRegistry(window, CTOR_KEY);
  assertStrictEquals(reg.getName(xcustom), null);
  reg.define("x-custom", xcustom);
  assertStrictEquals(reg.getName(xcustom), "x-custom");
});
