(function(window, document, undefined) {
  'use strict';

  class App {
    wrapper;
    pxPerMm = 96 / 25.4;
    pageHeight = 297 * this.pxPerMm; // A4 height 297mm
    pageWidth = 210 * this.pxPerMm; // A4 width 210mm
    pageBleed = 10 * this.pxPerMm; // 1cm edge bleeding

    pagePortraitBleeding = {
      top:  25 * this.pxPerMm,
      bottom: 50 * this.pxPerMm,
    };

    pageLandscapeBleeding = {
      top:  20 * this.pxPerMm,
      bottom: 9 * this.pxPerMm,
    };

    constructor() {
      this.wrapper = this.createElement('div', {id: 'page-wrapper'}, []);
      document.body.prepend(this.wrapper);
    }

    init() {
      try {
        const templates = Template.prepareTemplatesFromDom();
        const elements = templates.reduce((pageList, template) => {
          let pages = pageList.length ? pageList : [this.createPage(template.type === TemplateTypes.LandscapeVariable)];
          let lastPage = pages[pages.length - 1];
          if (template.fitAvailableHeight(lastPage.pageContent, this.pageHeight)) {
            lastPage.pageContent.appendChild(template.templateElement);
          } else if (template.type !== TemplateTypes.Fixed) {
            pages = this.recursiveSliceTemplate(pages, template);
          } else {
            pages = [...pages, this.createPage()];
            pages[pages.length - 1].pageContent.appendChild(template.templateElement);
            console.warn(`
            This template may be rendered in two pages. if so, please consider
            use tables with template type VARIABLE or LANDSCAPE_VARIABLE
            `)
          }
          return pages;
        }, []);
      } catch (e) {
        console.error(e);
      }
      this.wrapper.className = 'page-wrapper--ready';
    }

    /**
     * create page elements
     * @returns {({page: HTMLElement, pageContent: HTMLElement})}
     */
    createPage(isLandscape = false) {
      const pageContent = this.createElement('div', {class: 'page__content'}, []);
      const page = this.createElement('div', {class: isLandscape ? 'page page--landscape' : 'page'}, [pageContent]);

      pageContent.dataset.landscape = isLandscape? '1' : '0';

      this.addPageContentSetup(pageContent);
      this.wrapper.appendChild(page);
      return {
        page,
        pageContent,
      };
    }

    /**
     * setup width, height, margin, padding, etc.
     * to page content and that will fix the page style
     * with background
     * @param element {HTMLElement}
     */
    addPageContentSetup(element) {
      const isLandscape = element.dataset.landscape === '1';
      const bleeding = isLandscape ? this.pageLandscapeBleeding : this.pagePortraitBleeding;
      const { top, bottom } = bleeding;

      if (isLandscape) {
        element.style.width = `${this.pageHeight}px`;
        element.style.maxHeight = `${this.pageWidth}px`;
      } else {
        element.style.width = `${this.pageWidth}px`;
        element.style.maxHeight = `${this.pageHeight - (top + bottom)}px`;
      }

      element.style.paddingTop = `${top}px`;
      element.style.paddingBottom = `${bottom}px`;
      element.style.paddingLeft = `${this.pageBleed}px`;
      element.style.paddingRight = `${this.pageBleed}px`;
    }

    /**
     * create dom element
     * @param tag {string}
     * @param attributes {object}
     * @param children {HTMLElement[]}
     * @returns {*}
     */
    createElement(tag, attributes, children = []) {
      const element = document.createElement(tag);
      if (attributes) {
        Object.keys(attributes).forEach((key) => {
          element.setAttribute(key, attributes[key]);
        });
      }
      if (children) {
        children.forEach((child) => {
          element.appendChild(child);
        });
      }
      return element;
    }

    /**
     * recursive slice template rows into multiple pages
     * @param pages {({page: HTMLElement, pageContent: HTMLElement}[])}
     * @param template {Template}
     */
    recursiveSliceTemplate(pages, template) {
      const lastPage = pages[pages.length - 1];
      const isPageLandScape = lastPage.pageContent.dataset.landscape === '1';
      const isTemplateLandScape = template.type === TemplateTypes.LandscapeVariable;
      const isLastPageSameTemplate = (isPageLandScape && isTemplateLandScape) ||
        (!isPageLandScape && !isTemplateLandScape);

      if (!isLastPageSameTemplate) {
        return this.recursiveSliceTemplate(
          [...pages, this.createPage(template.type === TemplateTypes.LandscapeVariable)],
          template,
        );
      }

      const { top, bottom } = isTemplateLandScape ? this.pageLandscapeBleeding : this.pagePortraitBleeding;
      const pageHeight = isTemplateLandScape ? this.pageWidth : this.pageHeight;
      const requiredHeight = pageHeight - lastPage.pageContent.offsetHeight;
      const slicedTemplate = template.slice(Math.floor(requiredHeight));
      if (slicedTemplate.hasRows) {
        lastPage.pageContent.appendChild(slicedTemplate.templateElement);
      }

      if (template.hasRows) {
        return this.recursiveSliceTemplate([...pages, this.createPage(template.type === TemplateTypes.LandscapeVariable)], template);
      }
      template.destroy();
      return pages;
    }
  }

  window.__App = App;
  window.invoiceApp = new App();
  window.addEventListener('DOMContentLoaded', () => {
    invoiceApp.init();
  });
})(window, document);
