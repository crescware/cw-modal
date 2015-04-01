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

export class Dialog<T> {
  data: T;
  template: ng.IPromise<string>;
  width: number;
  dialogUuid: string;

  private rootElement: Node;
  private $rootScope: ng.IRootScopeService;

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
      if (dialogDefinition.templateUrl) {
        var url = dialogDefinition.templateUrl;

        var $templateCache: ng.ITemplateCacheService = $injector.get('$templateCache');
        var cache = $templateCache.get(url)[1];
        if (cache) {
          return resolve(cache);
        }

        var $http: ng.IHttpService = $injector.get('$http');
        $http.get(url).success((template: Promise.Thenable<string>) => {
          $templateCache.put(dialogDefinition.templateUrl, template);
          return resolve(template);
        });
        return;
      }
      if (!dialogDefinition.templateUrl && !dialogDefinition.template) {
        return reject('Template not found.');
      }
      return resolve(dialogDefinition.template);
    });
  }

  /**
   * @param {*} data - Any data you want to use in the dialog
   * @returns {string}
   */
  open(data: any): string {
    this.data = data;
    this.$rootScope.$broadcast('cwModal.Dialog#open', this);
    return this.dialogUuid;
  }

  /**
   * @param {MouseEvent} [event]
   * @returns {void}
   */
  close(event?: MouseEvent) {
    this.$rootScope.$broadcast('cwModal.Dialog#close', event, this);
  }

  /**
   * @param {function} cb
   * @returns {void}
   */
  onClose(cb: (angularEvent: ng.IAngularEvent, event: MouseEvent, ...args: any[]) => any) {
    this.$rootScope.$on(this.dialogUuid + '.onClose', cb);
  }
}