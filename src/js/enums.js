(function (window, document, undefined) {
  'use strict';
  const TemplateTypes = {
    Fixed: 'FIXED',
    Variable: 'VARIABLE',
    LandscapeVariable: 'LANDSCAPE_VARIABLE',
  }

  const TemplateItemTypes = {
    Body: 'BODY',
    Header: 'HEADER',
    Footer: 'FOOTER',
    Row: 'ROW',
    Container: 'CONTAINER',
  }

  window.TemplateTypes = TemplateTypes;
  window.TemplateItemTypes = TemplateItemTypes;
})(window, document);

