// ============================================
// DOMAIN - OrgNode Entity (Organigrama)
// ============================================

export class OrgNode {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly positionId: string | null,
    public readonly parentId: string | null,
    public readonly nodeId: string, // ReactFlow node ID
    public readonly label: string,
    public readonly type: string,
    public readonly positionX: number,
    public readonly positionY: number,
    public readonly metadata: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<OrgNode>): OrgNode {
    return new OrgNode(
      props.id || '',
      props.companyId || '',
      props.positionId || null,
      props.parentId || null,
      props.nodeId || '',
      props.label || '',
      props.type || 'default',
      props.positionX || 0,
      props.positionY || 0,
      props.metadata || {},
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  // Convert to ReactFlow format
  toReactFlowNode() {
    return {
      id: this.nodeId,
      type: this.type,
      position: { x: this.positionX, y: this.positionY },
      data: {
        label: this.label,
        positionId: this.positionId,
        ...this.metadata,
      },
    };
  }
}

export class OrgEdge {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly edgeId: string,
    public readonly sourceNodeId: string,
    public readonly targetNodeId: string,
    public readonly type: string,
    public readonly metadata: Record<string, any>,
  ) {}

  toReactFlowEdge() {
    return {
      id: this.edgeId,
      source: this.sourceNodeId,
      target: this.targetNodeId,
      type: this.type,
      ...this.metadata,
    };
  }
}
