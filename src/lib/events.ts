import EventEmitter from 'eventemitter3';

// This is a simple event emitter that can be used to broadcast events throughout the application.
// We use eventemitter3 as it's cross-platform and works in the browser.
export const errorEmitter = new EventEmitter();
