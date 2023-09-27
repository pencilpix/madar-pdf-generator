const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const createHandleBarsHelpers = require('./builder/helpers');
const TemplateBuilder = require('./builder/template-builder');

const isProduction = process.env.NODE_ENV === 'production';
const isPreview = process.env.MODE === 'preview';
const previewPath = path.resolve(__dirname, '../preview');
const templates = TemplateBuilder.start();

if (isPreview) {
  // delete files in preview folder
  fs.rmSync(previewPath, {recursive: true, force: true});
  // create preview folder
  fs.mkdirSync(previewPath);
}

(async () => {
  if (isProduction) {
    console.log('============== all templates is done in dist folder TaDa! ==============');
    return Promise.resolve();
  }

  createHandleBarsHelpers(Handlebars);

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: isPreview,
    slowMo: 250,
    devtools: true,
    timeout: 3000000, args: [
      '--start-maximized', // you can also use '--start-fullscreen'
      '--force-device-scale-factor=.8',
    ],
  });
  let pages = await browser.pages();
  while (pages.length < templates.length) {
    const page = await browser.newPage();
    pages = await browser.pages();
  }
  pages.map(async (page, i) => {
    const templateConfig = templates[i];
    const handlebarsTemplate = Handlebars.compile(templateConfig.template);
    const data = templateConfig.data[0]?.body || '{}';
    const html = handlebarsTemplate(JSON.parse(data));

    // 210mm x 297mm
    await page.setViewport({width: 794, height: 1123});
    const content = await page.setContent(html, {waitUntil: 'networkidle0'});
    if (isPreview) {
      console.log(`====== Generate PDF Preview for: ${templateConfig.name}/${templateConfig.fileName} Started`);
      const itemPreviewDir = path.resolve(previewPath, templateConfig.name);
      if (!fs.existsSync(itemPreviewDir)) {
        fs.mkdirSync(itemPreviewDir);
      }
      const pdf = await (new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000);
      }).then(async () => {
        const htmlOutput = await page.evaluate(() => document.documentElement.outerHTML)
        fs.writeFileSync(path.resolve(itemPreviewDir, `${templateConfig.fileName.split(/\.\w+$/)[0]}.html`), htmlOutput, 'utf8');
        return await page.pdf({
          path: path.resolve(itemPreviewDir, `${templateConfig.fileName.split(/\.\w+$/)[0]}.pdf`),
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
          }
        })
      }));

      console.log(`====== Generate PDF Preview for: ${templateConfig.name}/${templateConfig.fileName} Finished`);
      await browser.close();
    }
  })
})();

