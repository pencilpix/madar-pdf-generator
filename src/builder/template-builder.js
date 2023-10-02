const path = require('path');
const fs = require('fs');
const TemplateReader = require('./templates-reader');
const {templatesDirPath} = require("./templates-reader");

module.exports = {
  buildDir: path.resolve(__dirname, '../../dist'),
  buildTemplate(templateConfig) {
    let { scripts, styles, data, template } = templateConfig;
    styles = styles.map(({ src, body }) => `\n<style data-src="${src}">\n${body}\n</style>`)
      .join('\n  ');

    scripts = scripts
      .map(({src, body}) => `<script data-src="${src}">\n${body}\n</script>`)
      // will disable replacing all comments, but will check modify only comments conflicts with handlebars
      // .map((script) => script.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''));
      .join('\n  ');

    template = template.replace(/<\/head>/, `${styles}\n  </head>`);
    template = template.replace(/<\/body>/, `${scripts}\n  </body>`);
    return template;
  },

  /**
   * get all templates, parse and inline all it's contents
   * from templates directory
   * @returns {({name: string, fileName: string, template: string, data: any}[])}
   */
  start() {
    const directoriesWithTemplates = TemplateReader.getTemplates();
    const isProduction = process.env.NODE_ENV === 'production';
    const templates = [];
    if (isProduction) {
      fs.rmSync(this.buildDir, {recursive: true, force: true});
      fs.mkdirSync(this.buildDir);
    }
    directoriesWithTemplates.forEach((directory) => {
      console.log(`====== Building templates of dir: ${directory.name}`);
      directory.templates.forEach((templateConfig) => {
        templateConfig.template = this.buildTemplate(templateConfig);
        if (isProduction) {
          this.save(templateConfig);
        }
        templates.push(templateConfig);
      });
      console.log(`====== Building templates of dir: ${directory.name} is done`);
    });
    return templates;
  },

  /**
   * save template to build directory after inline content
   * it should be called in production mode only
   * @param templateConfig
   */
  save(templateConfig, dir = null) {
    const { name, fileName, template } = templateConfig;
    const buildPath = path.resolve(dir || this.buildDir, name);
    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath);
    }
    fs.rmSync(path.resolve(buildPath, fileName), {force: true});
    fs.writeFileSync(path.resolve(buildPath, fileName), template, 'utf8');
  }
}
