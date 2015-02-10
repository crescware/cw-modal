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

export module cwModal {
  var moduleName = 'cwModal';

  export class Dialog {
    /**
     * @constructor
     */
    constructor(private template: string) {
      //
    }

    /**
     * @returns {void}
     */
    open() {
      var $rootScope: ng.IRootScopeService = angular.element('.ng-scope').eq(0).scope();
      $rootScope.$broadcast('cwModal.Dialog#open', this.template);
    }
  }

  class Modal {
    /**
     * @constructor
     * @ngInject
     */
    constructor(
      private $rootScope: ng.IRootScopeService,
      private $element: ng.IAugmentedJQuery,
      private $compile: ng.ICompileService
    ) {
      this.init();
    }

    /**
     * @returns {void}
     */
    private init() {
      this.$rootScope.$on('cwModal.Dialog#open', this.onOpen.bind(this));
    }

    /**
     * @param {ng.IAngularEvent} _ non-use
     * @param {string} template
     * @returns {void}
     */
    private onOpen(_: ng.IAngularEvent, template: string) {
      this.$element.html('');
      angular.element(template).appendTo(this.$element);
      this.$compile(this.$element.contents())(this.$element.scope());
    }
  }

  /**
   * @constructor
   */
  export function ModalDDO() {
    return {
      restrict: 'E',
      template: '<p>Modal!</p>',
      controller: Modal,
      controllerAs: 'Modal'
    };
  }

  angular.module(moduleName, []);
  angular.module(moduleName).directive(moduleName, ModalDDO);
  angular.module(moduleName).factory('Dialog', () => Dialog);
}
