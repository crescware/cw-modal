/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../api/cw-modal.d.ts" />
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
     * @param {cw.DialogInstance} dialog
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
     * @param {cw.DialogInstance} dialog
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
