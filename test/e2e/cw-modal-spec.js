"use strict";

var injectBrowser = require('testium/mocha');
var assert = require('power-assert');

describe('cw-modal', () => {
  var browser;
  before(injectBrowser());
  beforeEach(function() {
    browser = this.browser;
  });
  beforeEach(() => {
    browser.navigateTo('/');
  });

  describe('index.html', () => {
    it('should be returned an HTTP status 200', () => {
      browser.assert.httpStatus(200);
    });
  });

  describe('The dialog', () => {
    it('should be displayed the title "Hello World"', () => {
      var button = browser.getElement('input[value="Open Dialog"]');
      button.click();
      browser.waitForElementExist('cw-dialog-dummy', 1000);
      browser.assert.elementHasText('cw-dialog-dummy h1', 'Hello World');
    });

    it('should be closed when click backdrop', () => {
      var button = browser.getElement('input[value="Open Dialog"]');
      button.click();
      browser.waitForElementExist('#cw-modal-display', 1000);
      var back = browser.getElement('#cw-modal-display');
      back.click();
      browser.assert.elementHasText('cw-modal', '');
    });
  });
});