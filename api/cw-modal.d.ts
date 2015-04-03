/**
 * cw-modal
 *
 * @copyright © 2015 Crescware
 * @since cw-modal v 0.0.1 (Feb 23, 2015)
 */

declare module cw {
  export interface ModalProperty<T> {
    dialog: DialogInstance<T>;
  }

  export interface DialogDefinition {
    template?: string;
    width?: number;
  }

  export interface DialogStatic {
    new(definition: DialogDefinition): cw.DialogInstance<any>;
    new<T>(definition: DialogDefinition): cw.DialogInstance<T>;
  }

  export interface DialogInstance<T> {
    template: ng.IPromise<string>;
    width?: number;
    dialogUuid: string;
    data: T;
    open(data: T): string;
    close(event?: MouseEvent): void;
    onClose(listener: (...args: any[]) => any): void;
    onKeyDown(listener: (keyEvent: KeyboardEvent) => void): void;
  }
}

declare module 'cw-modal' {
  export = cw;
}