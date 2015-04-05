/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
/// <reference path="../api/cw-modal.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/bluebird/bluebird.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="dialog.ts" />
'use strict';
var angular = window.angular || require('angular');
var events = require('events');
var Promise = require('bluebird');
var EventEmitter = events.EventEmitter;
exports.emitter = new EventEmitter();
exports.moduleName = 'cwModal';
var ID_DRAWING_PART = 'cw-modal-dialog-rect';
var Modal = (function () {
    /**
     * @constructor
     * @ngInject
     */
    function Modal($rootScope, $element, $compile, $scope, $timeout) {
        this.$rootScope = $rootScope;
        this.$element = $element;
        this.$compile = $compile;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.init();
    }
    /**
     * @returns {void}
     */
    Modal.prototype.init = function () {
        this.$scope.modalEnable = false;
        exports.emitter.on('Dialog#open', this.onOpen.bind(this));
        exports.emitter.on('Dialog#close', this.onClose.bind(this));
    };
    /**
     * @param {cw.DialogInstance} dialog
     * @returns {void}
     */
    Modal.prototype.onOpen = function (dialog) {
        var _this = this;
        console.assert(!!dialog, 'Argument "dialog" is missing');
        // Modal must be stored the dialog property to bind in Angular.
        this.dialog = dialog;
        // Loading DOM
        this.$scope.modalEnable = true;
        var promise = new Promise(function (resolve) {
            _this.$timeout(function () {
                return resolve(void 0);
            }, 0);
        });
        // After load
        promise.then(function () {
            (function () {
                // Remove a focus from the clicked button
                var el = document.createElement('input');
                document.body.appendChild(el);
                el.focus();
                document.body.removeChild(el);
            })();
            var el = document.getElementById('cw-modal-display');
            el.addEventListener('click', function (event) {
                event.stopPropagation();
                dialog.close(event);
            });
            document.onkeydown = function (event) {
                exports.emitter.emit(dialog.dialogUuid + '.onKeyDown', event);
            };
            return dialog.template;
        }).then(function (template) {
            var el = document.getElementById(ID_DRAWING_PART);
            el.innerHTML = template;
            el.addEventListener('click', function (event) {
                event.stopPropagation();
            });
            _this.$compile(el)(_this.$element.scope());
        })['catch'](function (err) {
            throw Error(err);
        });
    };
    /**
     * @param {MouseEvent} event
     * @param {cw.DialogInstance<any>} dialog
     * @returns {void}
     */
    Modal.prototype.onClose = function (event, dialog) {
        var _this = this;
        console.assert(!!dialog, 'Argument "dialog" is missing');
        // $timeout is required to apply changes of $scope.modalEnable
        this.$timeout(function () {
            document.getElementById(ID_DRAWING_PART).innerHTML = '';
            document.onkeydown = function () {}; // noop
            _this.$scope.modalEnable = false;
            _this.dialog = null;
            exports.emitter.emit(dialog.dialogUuid + '.onClose', event);
        }, 0);
    };
    return Modal;
})();
exports.Modal = Modal;
var HTML = '\n<div ng-if="modalEnable">\n  <div id="cw-modal-backdrop" style="z-index: 1040; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 0.5; background: rgb(51, 51, 51);"></div>\n  <div id="cw-modal-display" style="z-index: 1050; position: fixed; top: 0px; width: 100%; height: 100%; opacity: 1;">\n    <div id="' + ID_DRAWING_PART + '" class="modal-content" style="z-index: 1060; width: 600px; margin: 100px auto;"></div>\n  </div>\n</div>\n';
/**
 * @constructor
 */
function ddo() {
    return {
        controller: Modal,
        controllerAs: 'Modal',
        restrict: 'E',
        scope: {},
        template: HTML
    };
}
exports.angularModule = angular.module(exports.moduleName, []);
exports.angularModule.directive(exports.moduleName, ddo);