const puppeteer = require('puppeteer');
const fs = require('fs');
const mkdirp = require('mkdirp');

const writeHtml = (path, data) => new Promise((resolve, reject) => {

    fs.writeFile(path, data, (err) => {
        if (err) reject(err);
        resolve(`[${path}] has been saved!`);
    });

});

const scriptsLoading = (pendingScripts, page) => Promise.all(
    pendingScripts.map(script => new Promise((resolve, reject) => {

        const isPendingScript = (request) => (
            request.resourceType() === 'script' &&
            request.url().includes(script)
        );

        page.on('response', response => {
            const request = response.request()

            if (isPendingScript(request)) {
                console.log(`[${page.url()}] ${request.url()} loaded.`);
                resolve();
            }
        });

        page.on('requestfailed', request => {
            if (isPendingScript(request)) {
                console.log(`[${page.url()}] Fail to load ${request.url()}.`);
                reject();
            }
        })
    }))
);

const tagsClearing = (clearTags, page) => {
    if (!clearTags || !clearTags.length) return;

    console.log(`[${page.url()}] clear tags: ${clearTags}`);

    return page.evaluateHandle(tags => {
            const elements = document.querySelectorAll(tags);
            elements.forEach(el => el.remove());
        }, clearTags.join()
    );
};

module.exports = async (urls, dest, options = {}) => {
    const browser = await puppeteer.launch();

    const {
        pendingScripts = [],
        clearTags = ['script'],
        renderTimeout = 1000
    } = options;

    const savePage = async (url, path) => {
        const page = await browser.newPage();

        console.log(`[${url}] loading ...`);

        console.log(`[${url}] waiting for scripts: "${pendingScripts}" ...`);

        await Promise.all([
            scriptsLoading(pendingScripts, page),
            page.goto(url)
        ]);

        await page.waitFor(renderTimeout);

        await tagsClearing(clearTags, page);

        const html = await page.content();

        await page.close();

        return writeHtml(path, html);
    };

    await mkdirp(dest, {mode: 0o755}, err => {
        if (err) console.log(err.toString());
    });

    const promises = urls.map(url => {
        const pathname = (new URL(url)).pathname;
        const path = dest + (pathname === '/' ? '/index' : pathname) + '.html';

        return savePage(url, path);
    });

    await Promise.all(promises).then(() => {
        console.log('Success! All pages saved.');
    }).catch(e => {
        console.error(e.toString());
    });

    browser.close();

    console.log('Done. Browser closed.');
};