import { CollectionReference, DocumentReference } from 'firebase/firestore';

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  resource?: object;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied on ${context.operation.toUpperCase()} at ${context.path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.operation = context.operation;
    this.path = context.path;
    this.resource = context.requestResourceData;
  }
}
