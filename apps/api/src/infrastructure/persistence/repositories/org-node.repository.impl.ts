import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrgNode, OrgEdge } from '../../../domain/entities';
import { IOrgNodeRepository } from '../../../domain/repositories';

@Injectable()
export class OrgNodeRepositoryImpl implements IOrgNodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<{ nodes: OrgNode[]; edges: OrgEdge[] }> {
    const [nodes, edges] = await Promise.all([
      this.prisma.orgNode.findMany({ where: { companyId } }),
      this.prisma.orgEdge.findMany({ where: { companyId } }),
    ]);

    return {
      nodes: nodes.map(this.toNodeDomain),
      edges: edges.map(this.toEdgeDomain),
    };
  }

  async saveNodes(companyId: string, nodes: Partial<OrgNode>[]): Promise<OrgNode[]> {
    // Delete existing nodes first
    await this.prisma.orgNode.deleteMany({ where: { companyId } });

    // Create new nodes
    const created = await Promise.all(
      nodes.map((node) =>
        this.prisma.orgNode.create({
          data: {
            companyId,
            positionId: node.positionId,
            parentId: node.parentId,
            nodeId: node.nodeId!,
            label: node.label!,
            type: node.type || 'default',
            positionX: node.positionX || 0,
            positionY: node.positionY || 0,
            metadata: node.metadata || {},
          },
        }),
      ),
    );

    return created.map(this.toNodeDomain);
  }

  async saveEdges(companyId: string, edges: Partial<OrgEdge>[]): Promise<OrgEdge[]> {
    // Delete existing edges first
    await this.prisma.orgEdge.deleteMany({ where: { companyId } });

    // Create new edges
    const created = await Promise.all(
      edges.map((edge) =>
        this.prisma.orgEdge.create({
          data: {
            companyId,
            edgeId: edge.edgeId!,
            sourceNodeId: edge.sourceNodeId!,
            targetNodeId: edge.targetNodeId!,
            type: edge.type || 'default',
            metadata: edge.metadata || {},
          },
        }),
      ),
    );

    return created.map(this.toEdgeDomain);
  }

  async deleteByCompany(companyId: string): Promise<void> {
    await Promise.all([
      this.prisma.orgNode.deleteMany({ where: { companyId } }),
      this.prisma.orgEdge.deleteMany({ where: { companyId } }),
    ]);
  }

  private toNodeDomain(data: any): OrgNode {
    return OrgNode.create({
      id: data.id,
      companyId: data.companyId,
      positionId: data.positionId,
      parentId: data.parentId,
      nodeId: data.nodeId,
      label: data.label,
      type: data.type,
      positionX: data.positionX,
      positionY: data.positionY,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toEdgeDomain(data: any): OrgEdge {
    return new OrgEdge(
      data.id,
      data.companyId,
      data.edgeId,
      data.sourceNodeId,
      data.targetNodeId,
      data.type,
      data.metadata,
    );
  }
}
