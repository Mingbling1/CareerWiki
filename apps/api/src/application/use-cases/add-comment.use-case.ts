// ============================================
// APPLICATION - Use Cases: Add Comment (Anonymous)
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../../domain/entities';
import { ICommentRepository, COMMENT_REPOSITORY } from '../../domain/repositories';

export interface AddCommentInput {
  positionId: string;
  userId: string;
  content: string;
  rating?: number;
  pros?: string;
  cons?: string;
}

@Injectable()
export class AddCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(input: AddCommentInput): Promise<Comment> {
    return this.commentRepository.create({
      positionId: input.positionId,
      userId: input.userId,
      content: input.content,
      rating: input.rating,
      pros: input.pros,
      cons: input.cons,
    });
  }
}
