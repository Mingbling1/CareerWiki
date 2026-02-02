// ============================================
// DOMAIN - Company Entity
// ============================================

export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly industry: string | null,
    public readonly size: string | null,
    public readonly location: string | null,
    public readonly website: string | null,
    public readonly logoUrl: string | null,
    public readonly culture: string | null,
    public readonly benefits: string[],
    public readonly isVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<Company>): Company {
    return new Company(
      props.id || '',
      props.name || '',
      props.slug || '',
      props.description || null,
      props.industry || null,
      props.size || null,
      props.location || null,
      props.website || null,
      props.logoUrl || null,
      props.culture || null,
      props.benefits || [],
      props.isVerified || false,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }
}
