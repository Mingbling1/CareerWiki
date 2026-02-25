import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { UpdateProfileAvatarUseCase } from '../../../application/use-cases/update-profile-avatar.use-case';

class UpdateAvatarDto {
  @IsString()
  avatarUrl: string;
}

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly getOrCreateProfile: GetOrCreateProfileUseCase,
    private readonly updateProfileAvatar: UpdateProfileAvatarUseCase,
  ) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (creates if not exists)' })
  async getMe(@CurrentUser() user: any) {
    return this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });
  }

  @Patch('me/avatar')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile avatar' })
  async updateAvatar(
    @CurrentUser() user: any,
    @Body() dto: UpdateAvatarDto,
  ) {
    // Ensure profile exists first
    await this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    return this.updateProfileAvatar.execute({
      profileId: user.id,
      avatarUrl: dto.avatarUrl,
    });
  }
}
