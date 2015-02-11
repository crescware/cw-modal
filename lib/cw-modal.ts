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

      var modalBackdrop = angular.element('<div></div>');
      var modalBackdropId = 'cw-modal-backdrop';
      var modalBackdropZIndex = 1040;

      modalBackdrop.attr('id', modalBackdropId);
      modalBackdrop.css({
        'z-index': modalBackdropZIndex,
        position: 'fixed',
        top: 0,
        background: '#333',
        width: '100%',
        height: '100%',
        opacity: 0.5
      });

      var modalFront = angular.element('<div></div>');
      var modalFrontId = 'cw-modal-front';
      var modalFrontZIndex = modalBackdropZIndex + 10;

      modalFront.attr('id', modalFrontId);
      modalFront.css({
        'z-index': modalFrontZIndex,
        position: 'fixed',
        top: 0,
        width: '100%',
        height: '100%',
        opacity: 1
      });

      var dialogRect = angular.element('<div></div>');
      var dialogRectId = 'cw-modal-dialog-rect';
      var dialogRectZIndex = modalFrontZIndex + 10;

      dialogRect.attr({
        id: dialogRectId,
        'class': 'modal-content'
      });
      dialogRect.css({
        'z-index': dialogRectZIndex,
        width: '900px',
        margin: '100px auto'
      });

      this.$element.append(modalBackdrop).append(modalFront);
      angular.element('#'+modalFrontId).append(dialogRect);
      angular.element('#'+dialogRectId).append(template);
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
