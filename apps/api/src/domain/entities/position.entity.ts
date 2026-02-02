// ============================================
// DOMAIN - Position Entity
// ============================================

export class Position {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly departmentId: string | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly level: string | null,
    public readonly requirements: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<Position>): Position {
    return new Position(
      props.id || '',
      props.companyId || '',
      props.departmentId || null,
      props.title || '',
      props.description || null,
      props.level || null,
      props.requirements || [],
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }
}
