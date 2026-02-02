// ============================================
// APPLICATION - Use Cases: Get Organigrama
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { IOrgNodeRepository, ORG_NODE_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetOrganigramaUseCase {
  constructor(
    @Inject(ORG_NODE_REPOSITORY)
    private readonly orgNodeRepository: IOrgNodeRepository,
  ) {}

  async execute(companyId: string) {
    const { nodes, edges } = await this.orgNodeRepository.findByCompany(companyId);
    return {
      nodes: nodes.map((n) => n.toReactFlowNode()),
      edges: edges.map((e) => e.toReactFlowEdge()),
    };
  }
}
