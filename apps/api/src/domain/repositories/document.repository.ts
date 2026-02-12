import { Document } from '../entities/document.entity';

export interface IDocumentRepository {
  findByPosition(positionId: string): Promise<Document[]>;
  create(document: Partial<Document>): Promise<Document>;
  delete(id: string, userId: string): Promise<void>;
}

export const DOCUMENT_REPOSITORY = 'DOCUMENT_REPOSITORY';
