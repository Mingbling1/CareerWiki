import { Module } from '@nestjs/common';
import { CommentsController } from '../controllers/comments.controller';
import { GetCommentsUseCase, AddCommentUseCase } from '../../../application/use-cases';
import { CommentRepositoryImpl } from '../../persistence/repositories';
import { COMMENT_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [CommentsController],
  providers: [
    GetCommentsUseCase,
    AddCommentUseCase,
    {
      provide: COMMENT_REPOSITORY,
      useClass: CommentRepositoryImpl,
    },
  ],
})
export class CommentsModule {}
