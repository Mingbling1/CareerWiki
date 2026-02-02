import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetCommentsUseCase, AddCommentUseCase } from '../../../application/use-cases';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

class AddCommentDto {
  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  pros?: string;

  @IsString()
  @IsOptional()
  cons?: string;
}

@ApiTags('Comments')
@Controller('positions/:positionId/comments')
export class CommentsController {
  constructor(
    private readonly getComments: GetCommentsUseCase,
    private readonly addComment: AddCommentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get comments (anonymous)' })
  async findByPosition(@Param('positionId') positionId: string) {
    return this.getComments.execute(positionId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment (stored but displayed anonymously)' })
  async add(
    @Param('positionId') positionId: string,
    @Body() dto: AddCommentDto,
  ) {
    // TODO: Get userId from JWT token
    const userId = 'temp-user-id';
    return this.addComment.execute({
      positionId,
      userId,
      content: dto.content,
      rating: dto.rating,
      pros: dto.pros,
      cons: dto.cons,
    });
  }
}
