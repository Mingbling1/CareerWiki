// ============================================
// DOMAIN - Document Entity
// ============================================

export class Document {
  constructor(
    public readonly id: string,
    public readonly positionId: string,
    public readonly userId: string, // Stored but not exposed publicly
    public readonly title: string,
    public readonly description: string | null,
    public readonly url: string,
    public readonly type: string | null, // 'pdf' | 'link' | 'video' | 'image'
    public readonly category: string | null, // 'interview-prep' | 'job-description' | 'study-material'
    public readonly isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Document>): Document {
    return new Document(
      props.id || '',
      props.positionId || '',
      props.userId || '',
      props.title || '',
      props.description || null,
      props.url || '',
      props.type || null,
      props.category || null,
      props.isVerified || false,
      props.createdAt || new Date(),
    );
  }

  // Returns anonymous version for public display
  toAnonymous(): Omit<Document, 'userId'> {
    const { userId, ...anonymous } = this;
    return anonymous as Omit<Document, 'userId'>;
  }
}
