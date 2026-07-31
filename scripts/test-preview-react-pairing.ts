/* eslint-disable @typescript-eslint/no-require-imports -- diagnostic script comparing React instances */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

function HookTest() {
  const [value] = React.useState(42);
  return React.createElement("div", null, String(value));
}

const html = renderToStaticMarkup(React.createElement(HookTest));
console.log("project react + react-dom/server:", html);

const ReactNext = require("next/dist/compiled/react") as typeof React;
const RDSNext = require(
  "next/dist/compiled/react-dom/cjs/react-dom-server-legacy.node.development.js",
) as { renderToStaticMarkup: typeof renderToStaticMarkup };

try {
  renderToStaticMarkup(React.createElement(HookTest));
  console.log("mismatch test: project element with project rds OK");
} catch (error) {
  console.log(
    "mismatch unexpected:",
    error instanceof Error ? error.message : error,
  );
}

try {
  RDSNext.renderToStaticMarkup(React.createElement(HookTest));
  console.log("MISMATCH: project react + next rds should fail but succeeded");
} catch (error) {
  console.log(
    "expected mismatch:",
    error instanceof Error ? error.message.split("\n")[0] : error,
  );
}

function HookTestNext() {
  const [value] = ReactNext.useState(99);
  return ReactNext.createElement("div", null, String(value));
}

const htmlNext = RDSNext.renderToStaticMarkup(
  ReactNext.createElement(HookTestNext),
);
console.log("next react + next rds:", htmlNext);
