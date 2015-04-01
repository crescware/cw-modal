/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';

import angular = require('angular');
import Promise = require('bluebird');
import m = require('./modal');
import Modal = m.Modal;
import emitter = m.emitter;

export class Dialog<T> {
  data: T;
  template: ng.IPromise<string>;
  width: number;
  dialogUuid: string;

  private $rootScope: ng.IRootScopeService;
  private onCloseHandler: (...args: any[]) => void;
  private onKeyDownHandler: (keyEvent: KeyboardEvent) => void;
  private rootElement: Node;

  /**
   * @constructor
   */
  constructor(dialogDefinition: any) {
    if (dialogDefinition.template && dialogDefinition.templateUrl) {
      console.warn('Cannot specify both "template" and "templateUrl" in the AngularJS. In this case, "template" will be used.');
      delete dialogDefinition.templateUrl;
    }

    // Priority
    this.rootElement = document.querySelectorAll('.ng-scope')[0];
    this.$rootScope = angular.element(this.rootElement).scope();

    this.template = this.extractTemplate(dialogDefinition);
    this.width = dialogDefinition.width;
    this.dialogUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * @param {*} dialogDefinition
   * @returns {Promise<string>}
   */
  private extractTemplate(dialogDefinition: any): Promise<string> {
    var $injector: ng.auto.IInjectorService = angular.element(this.rootElement).injector();

    return new Promise<string>((resolve, reject) => {
      if (!dialogDefinition.templateUrl && !dialogDefinition.template) {
        reject('Template not found.');
        return;
      }
      if (!dialogDefinition.templateUrl) {
        resolve(dialogDefinition.template);
        return;
      }

      var $templateCache: ng.ITemplateCacheService = $injector.get('$templateCache');
      var url = dialogDefinition.templateUrl;

      var cache = $templateCache.get(url)[1];
      if (cache) {
        resolve(cache);
        return;
      }

      var $http: ng.IHttpService = $injector.get('$http');
      $http.get(url).success((template: Promise.Thenable<string>) => {
        $templateCache.put(dialogDefinition.templateUrl, template);
        resolve(template);
      });
    });
  }

  /**
   * @param {T} [data] - Any data you want to use in the dialog
   * @returns {string}
   */
  open(data?: T): string {
    this.data = data;
    emitter.emit('Dialog#open', this);
    return this.dialogUuid;
  }

  /**
   * @param {MouseEvent} [event]
   * @returns {void}
   */
  close(event?: MouseEvent) {
    emitter.emit('Dialog#close', event, this);
  }

  /**
   * @param {function} listener
   * @returns {void}
   */
  onClose(listener: (...args: any[]) => any) {
    emitter.on(this.dialogUuid + '.onClose', listener);
  }

  /**
   * @param {function} listener
   * @returns {void}
   */
  onKeyDown(listener: (keyEvent: KeyboardEvent) => void) {
    emitter.on(this.dialogUuid + '.onKeyDown', listener);
  }
}