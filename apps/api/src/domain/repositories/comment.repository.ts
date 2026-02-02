import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  findByPosition(positionId: string): Promise<Comment[]>;
  create(comment: Partial<Comment>): Promise<Comment>;
  delete(id: string, userId: string): Promise<void>; // Only owner can delete
}

export const COMMENT_REPOSITORY = 'COMMENT_REPOSITORY';
