// ============================================
// APPLICATION - Use Cases: Get or Create Profile
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../domain/entities/profile.entity';
import { IProfileRepository, PROFILE_REPOSITORY } from '../../domain/repositories/profile.repository';

const AVATAR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  `/illustrations/avatars/avatar-${String(i + 1).padStart(2, '0')}.png`,
);

function getRandomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

export interface GetOrCreateProfileInput {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class GetOrCreateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(input: GetOrCreateProfileInput): Promise<Profile> {
    // Check if profile already exists
    const existing = await this.profileRepository.findById(input.id);
    if (existing) return existing;

    // New profile — assign random avatar if none provided
    return this.profileRepository.upsert(input.id, {
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl || getRandomAvatar(),
    });
  }
}
