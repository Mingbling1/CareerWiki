// ============================================
// APPLICATION - Use Cases: Get Comments (Anonymous)
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository, COMMENT_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(positionId: string) {
    const comments = await this.commentRepository.findByPosition(positionId);
    // Return anonymous version (without userId)
    return comments.map((c) => c.toAnonymous());
  }
}
