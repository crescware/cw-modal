/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 23, 2015)
 */

declare module cw {
  export interface ModalProperty {
    dialog: DialogInstance;
  }

  export interface DialogInstance {
    template: ng.IPromise<string>;
    dialogUuid: string;
    open(): string;
    close(event?: JQueryEventObject): void;
    onClose(cb: (angularEvent: ng.IAngularEvent, jQueryEvent: JQueryEventObject, ...args: any[]) => any): void;
  }
}

declare module 'cw-modal' {
  export = cw;
}