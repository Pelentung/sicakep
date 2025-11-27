import { CollectionReference, DocumentReference } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  LIST = 'list',
  UPDATE = 'update',
  DELETE = 'delete',
}

export class FirestorePermissionError extends Error {
  operation: OperationType;
  path: string;
  resource?: object;

  constructor(
    operation: OperationType,
    ref: DocumentReference | CollectionReference,
    resource?: object
  ) {
    const path = ref.path;
    const message = `Firestore Permission Denied on ${operation.toUpperCase()} at ${path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.operation = operation;
    this.path = path;
    this.resource = resource;
  }
}
