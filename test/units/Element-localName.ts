import { DOMParser } from "../../deno-dom-wasm.ts";
import { assertStrictEquals as assertEquals } from "assert";

// TODO: More comprehensive tests

Deno.test("Element.localName", () => {
  const doc = new DOMParser().parseFromString(
    `
      <div></div>
      <article></article>
    `,
    "text/html",
  );

  const div = doc.querySelector("div")!;
  const article = doc.querySelector("article")!;

  assertEquals(div.localName, "div");
  assertEquals(article.localName, "article");
});
