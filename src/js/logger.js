(function (window, document, undefined) {
  class Logger {
    /**
     * log message to element as comment
     * @param element {HTMLElement}
     * @param message {string}
     */
    static log(element, message) {
      if (!element) {
        return;
      }
      this.insert(element, message, 'INFO');
    }

    static warn(element, message) {
      this.insert(element, message, 'WARN');
    }

    static error(message) {
      this.insert(element, message, 'ERROR');
    }

    static insert(element, message, prefix) {
      const fullMessage = `========[LOG]: ${prefix}========\n${message}\n========[END LOG]: ${prefix}========\n`;
      console.log(fullMessage)
      element.appendChild(document.createComment(fullMessage));
    }
  }
  window.Logger = Logger;
})(window, document);
