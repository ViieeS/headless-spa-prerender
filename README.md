# headless-spa-prerender

Pre-render single page application states and save as static HTML pages.

```bash
$ npm install spa-prerender --save-dev
```

## Synopsis
`prerender(...pages: Array<string>, destination: string, options?: Object)`

### Parameters
* `pages` \<Array> - list of URLs to parse.
* `destination` \<string> - output directory.
* `options` \<Object> - optional.
  * pendingScripts \<Array> - list of script names to load before parse. You can also specify a part of the names (e.g. "bundle" for "bundle-1.js", "bundle-2.js", etc.).
  * renderTimeout \<int> - timeout for render page DOM before parsing. Default: 1000ms.

## Example

```js
const prerender = require('spa-prerender');

const host = 'https://promonavigator.co.id';

const pageUrls = [
    `${host}/about`,
    `${host}/contacts`,
    `${host}/faq`,
    `${host}/index`,
    `${host}/prices`,
    `${host}/ref-land`,
];

prerender(pageUrls, './prerendered', {
    pendingScripts: ['core.js', 'front-office-2.js'], 
    renderTimeout: 2000
});
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
