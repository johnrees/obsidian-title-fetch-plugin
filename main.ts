import { Plugin } from "obsidian";

// TODO: move to env
const TITLE_PROXY = `https://tiny-wood-3152.squirrul.workers.dev`;

function isValidUrl(possibleUrl: string) {
  let url;
  try {
    url = new URL(possibleUrl);
  } catch (err) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const getTitle = (url: string) =>
  fetch([TITLE_PROXY, url].join("/"))
    .then((response) => response.json())
    .then(({ title }) => {
      return title;
    });

export default class FetchTitlePlugin extends Plugin {
  async onload() {
    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on("beforeChange", async (ev, change) => {
        if (
          change.origin === "paste" &&
          change.text.every(isValidUrl) &&
          // TODO: remove this limitation
          change.text.length === 1
        ) {
          const urls = [...change.text];

          // convert plain URLs into markdown format [](url)
          change.update(
            change.from,
            change.to,
            change.text.map((t) => `[](${t})`)
          );

          const changes = [];
          // fetch the titles of the URLs
          for (const url of urls) {
            changes.push(await getTitle(url));
          }
          // set cursor position inside the []
          const position = { line: change.from.line, ch: change.from.ch + 1 };
          ev.setCursor(position);
          // insert the URL/page title
          ev.replaceSelection(changes.join(""));
          // select it so that it can quickly be changed
          ev.setSelection(position, {
            ...position,
            ch: position.ch + changes.join("").length,
          });
        }
      });
    });
  }

  onunload() {
    console.log("unloading plugin");
  }
}
