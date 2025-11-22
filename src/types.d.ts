/**
 * Foundry VTT Type Declarations
 * These are global types available in Foundry VTT runtime
 */

declare global {
  // Basic Foundry VTT globals
  const game: Game;
  const ui: UI;
  const Hooks: Hooks;
  const CONFIG: CONFIG;
  const foundry: {
    utils: {
      mergeObject: <T extends Record<string, any>>(original: T, other: Partial<T>) => T;
    };
  };
  const renderTemplate: (template: string, data?: any) => Promise<string>;
  const $: JQueryStatic;
  const Handlebars: HandlebarsStatic;

  // Foundry VTT Core Types
  interface Game {
    user?: User;
    actors?: Actors;
    modules?: Map<string, any>;
    settings?: Settings;
    system?: {
      id: string;
      [key: string]: any;
    };
    i18n?: {
      localize: (key: string) => string;
      format: (key: string, data?: any) => string;
    };
    foundrybank?: {
      getBankManager: () => any;
      getEconomySystem: () => any;
      getEconomyManager: () => any;
      getLoanManager: () => any;
      getStockManager: () => any;
      getPropertyManager: () => any;
      getBankerSystem: () => any;
      openBankDialog: (token: Token) => void;
      openBankDialogFromBanker: (token: Token) => void;
    };
  }

  interface UI {
    notifications?: {
      info: (message: string) => void;
      warn: (message: string) => void;
      error: (message: string) => void;
    };
  }

  interface Hooks {
    on: (event: string, callback: (...args: any[]) => void) => void;
    once: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
    call: (event: string, ...args: any[]) => boolean;
  }

  interface CONFIG {
    [key: string]: any;
  }

  interface User {
    isGM?: boolean;
    character?: Actor;
  }

  interface Actors {
    owned: () => Actor[];
    filter: (filter: (actor: Actor) => boolean) => Actor[];
    map: <T>(callback: (actor: Actor) => T) => T[];
    get: (id: string) => Actor | undefined;
  }

  interface Settings {
    get: (module: string, key: string) => any;
    set: (module: string, key: string, value: any) => Promise<void>;
    register: (module: string, key: string, options: SettingOptions) => void;
  }

  interface SettingOptions {
    name?: string;
    hint?: string;
    scope?: 'world' | 'client';
    config?: boolean;
    type?: any;
    default?: any;
    onChange?: (value: any) => void;
    choices?: Record<string, string>;
    range?: {
      min: number;
      max: number;
      step: number;
    };
  }

  interface Actor {
    id: string;
    name: string;
    type: string;
    isOwner: boolean;
    system?: {
      currency?: any;
    };
    update: (data: Record<string, any>) => Promise<Actor>;
    setFlag: (scope: string, key: string, value: any) => Promise<void>;
    unsetFlag: (scope: string, key: string) => Promise<void>;
    getFlag: (scope: string, key: string) => any;
  }

  interface Token {
    id: string;
    actor: Actor | null;
    [key: string]: any;
  }

  interface TokenHUD {
    [key: string]: any;
  }

  class Application {
    constructor(options?: ApplicationOptions);
    render(force?: boolean, options?: any): Application;
    getData(): any;
    activateListeners(html: JQuery): void;
    static defaultOptions: ApplicationOptions;
  }

  interface ApplicationOptions {
    classes?: string[];
    width?: number;
    height?: number;
    resizable?: boolean;
    template?: string;
    title?: string;
  }

  class Dialog {
    constructor(options: DialogOptions);
    render(force?: boolean): Dialog;
  }

  interface DialogOptions {
    title: string;
    content: string | JQuery;
    buttons: Record<string, DialogButton>;
    default?: string;
  }

  interface DialogButton {
    icon?: string;
    label: string;
    callback?: (html: JQuery) => void | Promise<void>;
  }

  // JQuery namespace and types
  namespace JQuery {
    interface ClickEvent {
      preventDefault: () => void;
      stopPropagation: () => void;
      currentTarget: HTMLElement;
      button: number;
      shiftKey: boolean;
    }
  }

  interface JQueryStatic {
    (selector: string | HTMLElement | JQuery): JQuery;
    (html: string): JQuery;
  }

  interface JQuery {
    find: (selector: string) => JQuery;
    on: (event: string, handler: (event?: any) => void) => JQuery;
    append: (content: string | JQuery) => JQuery;
    after: (content: string | JQuery) => JQuery;
    data: (key: string, value?: any) => any;
    val: () => any;
    val: (value: any) => JQuery;
    length: number;
    is: (selector: string) => boolean;
    filter: (selector: string | ((index: number, element: HTMLElement) => boolean)) => JQuery;
  }

  namespace foundry {
    namespace utils {
      function mergeObject<T extends Record<string, any>>(original: T, other: Partial<T>): T;
    }
  }

  interface HandlebarsStatic {
    helpers: Record<string, (...args: any[]) => any>;
    registerHelper: (name: string, fn: (...args: any[]) => any) => void;
  }
}

export {};
