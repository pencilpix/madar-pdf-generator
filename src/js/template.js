(function(window, document, undefined) {
  class Template {
    rows;
    templateElement;
    type;
    body;
    header;
    footer;
    container;

    get hasRows() {
      return !!this.rows?.length;
    }

    /**
     * Template is responsible for managing templates
     * which will be divided into more thant page or not.
     * @param template {HTMLElement}
     * @param type {TemplateTypes}
     */
    constructor(template, type) {
      this.templateElement = template;
      this.type = type;
      this.prepareTemplate();
    }

    /**
     * copy wrapper, header, body, and footer
     * and get slice of rows that fit in selected height
     * @param maxHeight {number}};
     * @returns {Template}
     */
    slice(maxHeight) {
      const isLandscape = this.type === TemplateTypes.LandscapeVariable;
      const newTemplate = this.templateElement.cloneNode(true);
      const newTemplateBody = this.getTemplateItem(newTemplate, TemplateItemTypes.Body);
      const heightDetails = this.getAllElementsHeights();
      const totalHeight = heightDetails.emptyTemplateHeight + (isLandscape ? heightDetails.headerHeight : 0);
      const numberOfRows = Math.floor((maxHeight - totalHeight) / heightDetails.rowHeight);

      Logger.log(newTemplate, `\n{
        headerHeight: ${heightDetails.headerHeight},
        maxHeight: ${maxHeight},
        totalHeight: ${totalHeight},
        rowHeight: ${heightDetails.rowHeight},
        numberOfRows: ${numberOfRows},
      }\n`);

      newTemplateBody.innerHTML = '';

      if (this.type === TemplateTypes.LandscapeVariable) {
        newTemplateBody.innerHTML = this.header.outerHTML;
        // newTemplateBody.append(this.header.clone(true));
      }
      newTemplateBody.append(...this.rows.slice(0, numberOfRows));
      this.rows = this.rows.slice(numberOfRows);

      const template = new Template(newTemplate, this.type);
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
    prepareTemplate() {
      this.body = this.getTemplateItem(this.templateElement, TemplateItemTypes.Body);
      this.header = this.getTemplateItem(this.templateElement, TemplateItemTypes.Header);
      this.body = this.getTemplateItem(this.templateElement, TemplateItemTypes.Body);
      this.footer = this.getTemplateItem(this.templateElement, TemplateItemTypes.Footer);
      this.container = this.getTemplateItem(this.templateElement, TemplateItemTypes.Container);
      if (this.type !== TemplateTypes.Fixed) {
        this.rows = this.getTemplateItem(this.templateElement, TemplateItemTypes.Row, true);
        if (!this.rows.length) {
          console.warn(`This template needs to have rows in order to calculate rows per height`)
          console.log(this);
        }
      }

      if (this.type === TemplateTypes.LandscapeVariable) {
        if (this.header && this.header.parentNode) {
          const height = this.header.offsetHeight;
          const row = this.header.querySelector('tr').cloneNode(true);
          this.header.parentNode.removeChild(this.header);
          this.header = row;
          this.header.className = 'table__header';
          this.header.style.height = `${height}px`;
          this.header.dataset.height = height;
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
      const rowHeight = Math.max(...this.rows.map(row => row.offsetHeight));
      const bodyHeight = (parseInt(this.body.style.paddingTop, 10) + parseInt(this.body.style.paddingBottom, 10)) || 0;
      const headerHeight = +(this.type === TemplateTypes.LandscapeVariable
          ? this.header?.dataset.height
          : (this.header?.offsetHeight || 0));
      if (this.type === TemplateTypes.LandscapeVariable) {
        console.log(this.header, headerHeight);
      }
      const footerHeight = this.footer?.offsetHeight || 0;
      this.body.style.display = 'none';
      const emptyTemplateHeight = this.templateElement.offsetHeight;
      this.body.style.display = '';
      return {
        rowHeight,
        bodyHeight,
        headerHeight,
        footerHeight,
        emptyTemplateHeight,
      }
    }

    /**
     * get template items from dom directly
     * @returns {Template[]}
     */
    static prepareTemplatesFromDom() {
      const templates = document.querySelectorAll('[data-template]');
      return [].map.call(templates, (template) => {
        const type = template.dataset.template;
        return new Template(template, type);
      });
    }
  }

  window.Template = Template;
})(window, document);
