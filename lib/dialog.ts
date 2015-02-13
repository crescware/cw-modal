/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
'use strict';

var angular = this.angular || require('angular');
import cwm = require('./cw-modal');
import cwmm = cwm.cwModal;

export module cwModal {
  export class Dialog {
    public template: ng.IPromise<string>;
    public dialogUuid: string;

    private $rootScope: ng.IRootScopeService;

    /**
     * @constructor
     */
    constructor(dialogDefinition: any) {
      if (dialogDefinition.template && dialogDefinition.templateUrl) {
        console.warn('Cannot specify both "template" and "templateUrl" in the AngularJS. In this case, "template" will be used.');
        delete dialogDefinition.templateUrl;
      }
      this.template = this.extractTemplate(dialogDefinition);
      this.dialogUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
      this.$rootScope = angular.element('.ng-scope').eq(0).scope();
    }

    /**
     * @returns {string}
     */
    open(): string {
      this.$rootScope.$broadcast('cwModal.Dialog#open', this);
      return this.dialogUuid;
    }

    /**
     * @param {function} cb
     * @returns {void}
     */
    onClose(cb: (angularEvent: ng.IAngularEvent, jQueryEvent: JQueryEventObject, ...args: any[]) => any) {
      this.$rootScope.$on(this.dialogUuid + '.onClose', cb);
    }

    /**
     * @param {*} dialogDefinition
     * @returns {ng.IPromise<string>}
     */
    private extractTemplate(dialogDefinition: any): ng.IPromise<string> {
      var $injector: ng.auto.IInjectorService = angular.element('.ng-scope').eq(0).injector();
      var $q: ng.IQService = $injector.get('$q');

      return new $q<string>((resolve, reject) => {
        if (dialogDefinition.templateUrl) {
          var url = dialogDefinition.templateUrl;

          var $templateCache: ng.ITemplateCacheService = $injector.get('$templateCache');
          var cache = $templateCache.get(url)[1];
          if (cache) {
            return resolve(cache);
          }

          var $http: ng.IHttpService = $injector.get('$http');
          $http.get(url).success((template: string) => {
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
  }

  angular.module(cwmm.moduleName).factory('Dialog', () => Dialog);
}
