import { OrgNode, OrgEdge } from '../entities/org-node.entity';

export interface IOrgNodeRepository {
  findByCompany(companyId: string): Promise<{ nodes: OrgNode[]; edges: OrgEdge[] }>;
  saveNodes(companyId: string, nodes: Partial<OrgNode>[]): Promise<OrgNode[]>;
  saveEdges(companyId: string, edges: Partial<OrgEdge>[]): Promise<OrgEdge[]>;
  deleteByCompany(companyId: string): Promise<void>;
}

export const ORG_NODE_REPOSITORY = 'ORG_NODE_REPOSITORY';
