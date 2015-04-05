/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 8, 2015)
 */
'use strict';
var angular = window.angular || require('angular');
var Promise = require('bluebird');
var m = require('./modal');
var angularModule = m.angularModule;
var emitter = m.emitter;
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
        this.rootElement = document.querySelectorAll('.ng-scope')[0];
        this.$rootScope = angular.element(this.rootElement).scope();
        this.template = this.extractTemplate(dialogDefinition);
        this.width = dialogDefinition.width;
        this.dialogUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : r & 3 | 8;
            return v.toString(16);
        });
    }
    /**
     * @param {*} dialogDefinition
     * @returns {Promise<string>}
     */
    Dialog.prototype.extractTemplate = function (dialogDefinition) {
        var $injector = angular.element(this.rootElement).injector();
        return new Promise(function (resolve, reject) {
            if (!dialogDefinition.templateUrl && !dialogDefinition.template) {
                reject('Template not found.');
                return;
            }
            if (!dialogDefinition.templateUrl) {
                resolve(dialogDefinition.template);
                return;
            }
            var $templateCache = $injector.get('$templateCache');
            var url = dialogDefinition.templateUrl;
            var cache = $templateCache.get(url)[1];
            if (cache) {
                resolve(cache);
                return;
            }
            var $http = $injector.get('$http');
            $http.get(url).success(function (template) {
                $templateCache.put(dialogDefinition.templateUrl, template);
                resolve(template);
            });
        });
    };
    /**
     * @param {T} [data] - Any data you want to use in the dialog
     * @returns {string}
     */
    Dialog.prototype.open = function (data) {
        this.data = data;
        emitter.emit('Dialog#open', this);
        return this.dialogUuid;
    };
    /**
     * @param {MouseEvent} [event]
     * @returns {void}
     */
    Dialog.prototype.close = function (event) {
        emitter.emit('Dialog#close', event, this);
    };
    /**
     * @param {function} listener
     * @returns {void}
     */
    Dialog.prototype.onClose = function (listener) {
        emitter.on(this.dialogUuid + '.onClose', listener);
    };
    /**
     * @param {function} listener
     * @returns {void}
     */
    Dialog.prototype.onKeyDown = function (listener) {
        emitter.on(this.dialogUuid + '.onKeyDown', listener);
    };
    return Dialog;
})();
exports.Dialog = Dialog;
angularModule.factory('Dialog', function () {
    return Dialog;
});