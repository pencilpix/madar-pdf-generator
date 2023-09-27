const fs = require('fs');
const path = require('path');

module.exports = {
  templatesDirPath: path.resolve(__dirname, '../templates'),
  /**
   * get all templates from templates directory
   * @returns {({dirPath: string, name: string, templates: {name: string, fileName: string, template: string, styles: {src: string, body: string}[], scripts: {src: string, body: string}[], data: {src: string, body: string}[]}[])[]}
   */
  getTemplates() {
    return this.getDirectoryNames()
      .reduce((group, name) => {
        const dirPath = path.resolve(this.templatesDirPath, name);
        group.push({
          dirPath,
          name,
          templates: this.getFileNames(name, '.hbs').map((fileName) => {
            let config = {
              name,
              fileName,
              template: fs.readFileSync(path.resolve(dirPath, fileName), 'utf8'),
            };
            config = this.getStylesFromTemplate(dirPath, config);
            config = this.getScriptsFromTemplate(dirPath, config);
            config = this.getTestDataFromTemplate(dirPath, config);
            return config;
          }),
        });
        return group;
      }, []);
  },

  getDirectoryNames(relativePath = '') {
    return fs.readdirSync(path.resolve(this.templatesDirPath, relativePath))
      .map((name) => [name, fs.statSync(path.resolve(this.templatesDirPath, name))])
      .filter(([name, stat]) => stat.isDirectory())
      .map(([name, stats]) => name);
  },

  getFileNames(relativePath, extension) {
    const dir = path.resolve(this.templatesDirPath, relativePath);
    return fs.readdirSync(dir)
      .map((name) => [name, fs.statSync(path.resolve(dir, name))])
      .filter(([name, stat]) => !stat.isDirectory() && name.toLowerCase().endsWith(extension.toLowerCase()))
      .map(([name]) => name);
  },

  getStylesFromTemplate(dirPath, data) {
    const linkPattern = /<link.*href="(.*)".*\/>/g;
    const linkUrlPattern = /href="(.*)"/;
    const styleConfig = this.getFromTemplate(dirPath, data, linkPattern, linkUrlPattern);
    return {
      ...data,
      styles: styleConfig.refs,
      template: styleConfig.template,
    };
  },

  getScriptsFromTemplate(dirPath, data) {
    const scriptPattern = /<script.*src="(.*)".*><\/script>/g;
    const scriptUrlPattern = /src="(.*)"/;
    const scriptConfig = this.getFromTemplate(dirPath, data, scriptPattern, scriptUrlPattern);
    return {
      ...data,
      scripts: scriptConfig.refs,
      template: scriptConfig.template,
    };
  },

  getTestDataFromTemplate(dirPath, data) {
    const testPattern = /<meta.*name="test-data".*src="(.*)".*\/>/g;
    const testUrlPattern = /src="(.*)"/;
    const testConfig = this.getFromTemplate(dirPath, data, testPattern, testUrlPattern);

    return {
      ...data,
      data: testConfig.refs,
      template: testConfig.template,
    };
  },

  getFromTemplate(dirPath, data, refPattern, refUrlPattern) {
    const refs = (data.template.match(refPattern) || []).map((ref) => {
      const url = ref.match(refUrlPattern)[1] || null;
      return url ? {path: path.resolve(dirPath, url), src: url } : null;
    }).filter(s => !!s);

    return {
      refs: refs.map(({ src, path}) => ({
        src,
        body: fs.readFileSync(path, 'utf8')
      })),
      template: data.template
        .replace(refPattern, '')
        .replace(/\s*\n\s*\n/g, '\n'),
    };
  }
}
