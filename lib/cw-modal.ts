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

  interface ModalElement {
    element: JQuery;
    id: string;
    zIndex: number;
  }

  export class Dialog {
    public template: Promise<string>;

    /**
     * @constructor
     */
    constructor(dialogDefinition: any) {
      if (dialogDefinition.template && dialogDefinition.templateUrl) {
        console.warn('Cannot specify both "template" and "templateUrl" in the AngularJS. In this case, "template" will be used.')
        delete dialogDefinition.templateUrl;
      }
      this.template = this.extractTemplate(dialogDefinition);
    }

    /**
     * @returns {void}
     */
    open() {
      var $rootScope: ng.IRootScopeService = angular.element('.ng-scope').eq(0).scope();
      $rootScope.$broadcast('cwModal.Dialog#open', this);
    }

    /**
     * @param {*} dialogDefinition
     * @returns {Promise<string>}
     */
    private extractTemplate(dialogDefinition: any): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        if (dialogDefinition.templateUrl) {
          var url = dialogDefinition.templateUrl;

          var $injector: ng.auto.IInjectorService = angular.element('.ng-scope').eq(0).injector();
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
          return reject();
        }
        console.log('dialogDefinition.template');
        return resolve(dialogDefinition.template);
      });
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
     * @param {Dialog} dialog
     * @returns {void}
     */
    private onOpen(_: ng.IAngularEvent, dialog: Dialog) {
      this.$element.html('');

      var backdrop = this.createModalBackdrop();
      var display = this.createModalDisplay(backdrop.zIndex);
      var dialogRect = this.createDialogRect(display.zIndex);

      dialog.template.then((template: string) => {
        this.$element.append(backdrop.element).append(display.element);
        angular.element('#'+display.id).append(dialogRect.element);
        angular.element('#'+dialogRect.id).append(template);
        this.$compile(this.$element.contents())(this.$element.scope());
      }).catch(() => {
        throw Error('Template not found.');
      });
    }

    /**
     * @returns {ModalElement}
     */
    private createModalBackdrop(): ModalElement {
      var element = angular.element('<div></div>');
      var id = 'cw-modal-backdrop';
      var zIndex = 1040;

      element.attr({id: id});
      element.css({
        'z-index': zIndex,
        position: 'fixed',
        top: 0,
        width: '100%',
        height: '100%',
        background: '#333',
        opacity: 0.5
      });

      return {
        element: element,
        id: id,
        zIndex: zIndex
      };
    }

    /**
     * @param {number} backZIndex
     * @returns {ModalElement}
     */
    private createModalDisplay(backZIndex: number): ModalElement {
      var element = angular.element('<div></div>');
      var id = 'cw-modal-front';
      var zIndex = backZIndex + 10;

      element.attr({id: id});
      element.css({
        'z-index': zIndex,
        position: 'fixed',
        top: 0,
        width: '100%',
        height: '100%',
        opacity: 1
      });

      return {
        element: element,
        id: id,
        zIndex: zIndex
      };
    }

    private createDialogRect(backZIndex: number): ModalElement {
      var element = angular.element('<div></div>');
      var id = 'cw-modal-dialog-rect';
      var zIndex = backZIndex + 10;

      element.attr({
        id: id,
        'class': 'modal-content'
      });
      element.css({
        'z-index': zIndex,
        width: '900px',
        margin: '100px auto'
      });

      return {
        element: element,
        id: id,
        zIndex: zIndex
      };
    }
  }

  /**
   * @constructor
   */
  export function ModalDDO() {
    return {
      restrict: 'E',
      template: '',
      controller: Modal,
      controllerAs: 'Modal'
    };
  }

  angular.module(moduleName, []);
  angular.module(moduleName).directive(moduleName, ModalDDO);
  angular.module(moduleName).factory('Dialog', () => Dialog);
}
