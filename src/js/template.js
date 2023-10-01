(function(window, document, undefined) {
  class Template {
    rows;
    templateElement;
    type;
    body;
    header;
    footer;
    container;
    heights;

    get hasRows() {
      return !!this.rows?.length;
    }

    /**
     * Template is responsible for managing templates
     * which will be divided into more thant page or not.
     * @param template {HTMLElement}
     * @param type {TemplateTypes}
     * @param initialHeights {object}
     */
    constructor(template, type, initialHeights = null) {
      this.templateElement = template;
      this.type = type;
      this.heights = initialHeights;
      this.prepareTemplate();

      if (this.type !== TemplateTypes.Fixed) {
        Logger.log(this.templateElement, `
        parent: ${this.templateElement.parentNode?.getAttribute('id')}
        after template is created: [${this.type}]
        ${JSON.stringify(this.getAllElementsHeights(), null ,2)}
        `)
      }
    }

    /**
     * copy wrapper, header, body, and footer
     * and get slice of rows that fit in selected height
     * @param maxHeight {number}};
     * @returns {Template}
     */
    slice(maxHeight) {
      const newTemplate = this.templateElement.cloneNode(true);
      const newTemplateBody = this.getTemplateItem(newTemplate, TemplateItemTypes.Body);
      const numberOfRows = Math.floor((maxHeight - this.heights.withoutRows) / this.heights.row);

      Logger.log(newTemplate, `\nNumber of rows: ${numberOfRows}\n${JSON.stringify(this.heights)}\n`);

      newTemplateBody.innerHTML = '';

      if (this.type === TemplateTypes.LandscapeVariable) {
        newTemplateBody.innerHTML = this.header.outerHTML;
      }
      newTemplateBody.append(...this.rows.slice(0, numberOfRows));
      this.rows = this.rows.slice(numberOfRows);

      const template = new Template(newTemplate, this.type, this.heights);
      this.body.innerHTML = '';
      this.body.append(...this.rows);
      return template;
    }

    /**
     * check if template fit available height
     * @param pageContent {HTMLElement}
     * @param maxHeight {number}
     */
    fitAvailableHeight(pageContent, maxHeight) {
      const pageContentHeight = pageContent.offsetHeight;
      const templateHeight = this.templateElement.offsetHeight;
      return pageContentHeight + templateHeight <= maxHeight
    }

    destroy() {
      this.templateElement.parentNode.removeChild(this.templateElement);
    }

    /**
     * store each template item (header, footer, body, ...etc)
     * to related instance property
     * that will be used while rendering in different scenarios
     */
    prepareTemplate(initialHeights = null) {
      this.body = this.getTemplateItem(this.templateElement, TemplateItemTypes.Body);
      this.header = this.getTemplateItem(this.templateElement, TemplateItemTypes.Header);
      this.footer = this.getTemplateItem(this.templateElement, TemplateItemTypes.Footer);
      this.container = this.getTemplateItem(this.templateElement, TemplateItemTypes.Container);
      if (this.type !== TemplateTypes.Fixed) {
        this.rows = this.getTemplateItem(this.templateElement, TemplateItemTypes.Row, true);
        if (!this.rows.length) {
          console.warn(`This template needs to have rows in order to calculate rows per height`)
          console.log(this);
        }
      }

      if (!this.heights) {
        this.heights = this.getAllElementsHeights();
      }

      if (this.type === TemplateTypes.LandscapeVariable) {
        if (this.header && this.header.parentNode) {
          Promise.resolve().then(() => {
            const row = this.header.querySelector('tr').cloneNode(true);
            this.header.parentNode.removeChild(this.header);
            this.header = row;
            this.header.className = 'table__header';
          });

        }
      }
    }

    /**
     * get element child of current template;
     * @param templateElement {HTMLElement}
     * @param type {TemplateItemTypes}
     * @param all {boolean}
     * @returns {HTMLElement|HTMLElement[]}
     */
    getTemplateItem(templateElement, type, all = false) {
      return all
        ? [].slice.call(templateElement.querySelectorAll(`[data-template-element="${type}"]`), 0)
        : templateElement.querySelector(`[data-template-element="${type}"]`);
    }

    getAllElementsHeights() {

      return {
        row: this.rows?.length ? Math.max(...this.rows.map(row => row.offsetHeight)) : 0,
        body: this.body?.offsetHeight || 0,
        header: this.header?.offsetHeight || 0,
        footer: this.footer?.offsetHeight || 0,
        container: this.container?.offsetHeight || 0,
        withoutRows: (() => {
          const el = this.body || this.container;
          let height = 0;
          if (el) el.style.display = 'none';
          height = this.templateElement.offsetHeight || 0;
          if (el) el.style.display = '';
          return height;
        })(),
      }
    }

    /**
     * get template items from dom directly
     * @returns {Template[]}
     */
    static prepareTemplatesFromDom() {
      const types = Object.values(TemplateTypes);
      const templates = document.querySelectorAll('[data-template]');
      return [].map.call(templates, (template) => {
        const type = template.dataset.template;
        if (types.includes(type)) {
          return new Template(template, type);
        }
      }).filter(template => template);
    }
  }

  window.Template = Template;
})(window, document);
