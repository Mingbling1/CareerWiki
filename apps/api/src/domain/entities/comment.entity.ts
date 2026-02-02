// ============================================
// DOMAIN - Comment Entity
// ============================================

export class Comment {
  constructor(
    public readonly id: string,
    public readonly positionId: string,
    public readonly userId: string, // Stored but not exposed publicly
    public readonly content: string,
    public readonly rating: number | null, // 1-5
    public readonly pros: string | null,
    public readonly cons: string | null,
    public readonly isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Comment>): Comment {
    return new Comment(
      props.id || '',
      props.positionId || '',
      props.userId || '',
      props.content || '',
      props.rating || null,
      props.pros || null,
      props.cons || null,
      props.isVerified || false,
      props.createdAt || new Date(),
    );
  }

  // Returns anonymous version for public display
  toAnonymous(): Omit<Comment, 'userId'> {
    const { userId, ...anonymous } = this;
    return anonymous as Omit<Comment, 'userId'>;
  }
}
