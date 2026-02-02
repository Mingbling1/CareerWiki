import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '../../../domain/entities';
import { ICommentRepository } from '../../../domain/repositories';

@Injectable()
export class CommentRepositoryImpl implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPosition(positionId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { positionId },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map(this.toDomain);
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        positionId: data.positionId!,
        userId: data.userId!,
        content: data.content!,
        rating: data.rating,
        pros: data.pros,
        cons: data.cons,
      },
    });
    return this.toDomain(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.comment.deleteMany({
      where: { id, userId },
    });
  }

  private toDomain(data: any): Comment {
    return Comment.create({
      id: data.id,
      positionId: data.positionId,
      userId: data.userId,
      content: data.content,
      rating: data.rating,
      pros: data.pros,
      cons: data.cons,
      isVerified: data.isVerified,
      createdAt: data.createdAt,
    });
  }
}
