/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="dialog.ts" />
'use strict';
var angular = this.angular || require('angular');
var Modal = (function () {
    /**
     * @constructor
     * @ngInject
     */
    function Modal($rootScope, $element, $compile) {
        this.$rootScope = $rootScope;
        this.$element = $element;
        this.$compile = $compile;
        this.init();
    }
    Modal.$inject = ['$rootScope', '$element', '$compile'];
    /**
     * @returns {void}
     */
    Modal.prototype.init = function () {
        this.$rootScope.$on('cwModal.Dialog#open', this.onOpen.bind(this));
        this.$rootScope.$on('cwModal.Dialog#close', this.onClose.bind(this));
    };
    /**
     * @param {ng.IAngularEvent} _ non-use
     * @param {Dialog} dialog
     * @returns {void}
     */
    Modal.prototype.onOpen = function (_, dialog) {
        var _this = this;
        this.dialog = dialog;
        this.$element.html('');
        var backdrop = this.createModalBackdrop();
        var display = this.createModalDisplay(backdrop.zIndex);
        var dialogRect = this.createDialogRect(display.zIndex);
        this.$element.append(backdrop.element).append(display.element);
        angular.element('#' + display.id).append(dialogRect.element).on('click', function (event) {
            event.stopPropagation();
            dialog.close(event);
        });
        dialog.template.then(function (template) {
            var templateEl = angular.element(template);
            angular.element('#' + dialogRect.id).append(template).on('click', function (event) {
                event.stopPropagation();
            });
            _this.$compile(_this.$element.contents())(_this.$element.scope());
        }).catch(function (err) {
            throw Error(err);
        });
    };
    /**
     * @param {ng.IAngularEvent} _ non-use
     * @param {JQueryEventObject} jQueryEvent
     * @param {Dialog} dialog
     * @returns {void}
     */
    Modal.prototype.onClose = function (_, jQueryEvent, dialog) {
        this.$element.html('');
        this.dialog = null;
        this.$rootScope.$broadcast(dialog.dialogUuid + '.onClose', jQueryEvent);
    };
    /**
     * @returns {ModalElement}
     */
    Modal.prototype.createModalBackdrop = function () {
        var element = angular.element('<div></div>');
        var id = 'cw-modal-backdrop';
        var zIndex = 1040;
        element.attr({ id: id });
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
    };
    /**
     * @param {number} backZIndex
     * @returns {ModalElement}
     */
    Modal.prototype.createModalDisplay = function (backZIndex) {
        var element = angular.element('<div></div>');
        var id = 'cw-modal-display';
        var zIndex = backZIndex + 10;
        element.attr({ id: id });
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
    };
    /**
     * @param {number} backZIndex
     * @returns {ModalElement}
     */
    Modal.prototype.createDialogRect = function (backZIndex) {
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
    };
    Modal.moduleName = 'cwModal';
    return Modal;
})();
/**
 * @constructor
 */
function ModalDDO() {
    return {
        restrict: 'E',
        template: '',
        controller: Modal,
        controllerAs: 'Modal',
        scope: {}
    };
}
angular.module(Modal.moduleName, []);
angular.module(Modal.moduleName).directive(Modal.moduleName, ModalDDO);
this.Modal = Modal;

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
var Modal = this.Modal || require('./cw-modal').Modal;
var Dialog = (function () {
    /**
     * @constructor
     */
    function Dialog(dialogDefinition) {
        if (dialogDefinition.template && dialogDefinition.templateUrl) {
            console.warn('Cannot specify both "template" and "templateUrl" in the AngularJS. In this case, "template" will be used.');
            delete dialogDefinition.templateUrl;
        }
        // Priority
        this.rootElement = angular.element('.ng-scope').eq(0);
        this.$rootScope = this.rootElement.scope();
        this.template = this.extractTemplate(dialogDefinition);
        this.dialogUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * @param {*} dialogDefinition
     * @returns {ng.IPromise<string>}
     */
    Dialog.prototype.extractTemplate = function (dialogDefinition) {
        var $injector = this.rootElement.injector();
        var $q = $injector.get('$q');
        return new $q(function (resolve, reject) {
            if (dialogDefinition.templateUrl) {
                var url = dialogDefinition.templateUrl;
                var $templateCache = $injector.get('$templateCache');
                var cache = $templateCache.get(url)[1];
                if (cache) {
                    return resolve(cache);
                }
                var $http = $injector.get('$http');
                $http.get(url).success(function (template) {
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
    };
    /**
     * @returns {string}
     */
    Dialog.prototype.open = function () {
        this.$rootScope.$broadcast('cwModal.Dialog#open', this);
        return this.dialogUuid;
    };
    /**
     * @param {JQueryEventObject} [event]
     * @returns {void}
     */
    Dialog.prototype.close = function (event) {
        this.$rootScope.$broadcast('cwModal.Dialog#close', event, this);
    };
    /**
     * @param {function} cb
     * @returns {void}
     */
    Dialog.prototype.onClose = function (cb) {
        this.$rootScope.$on(this.dialogUuid + '.onClose', cb);
    };
    return Dialog;
})();
angular.module(Modal.moduleName).factory('Dialog', function () { return Dialog; });
this.Dialog = Dialog;
