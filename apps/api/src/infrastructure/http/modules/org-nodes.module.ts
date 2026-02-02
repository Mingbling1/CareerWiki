import { Module } from '@nestjs/common';
import { OrgNodesController } from '../controllers/org-nodes.controller';
import { GetOrganigramaUseCase } from '../../../application/use-cases';
import { OrgNodeRepositoryImpl } from '../../persistence/repositories';
import { ORG_NODE_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [OrgNodesController],
  providers: [
    GetOrganigramaUseCase,
    {
      provide: ORG_NODE_REPOSITORY,
      useClass: OrgNodeRepositoryImpl,
    },
  ],
})
export class OrgNodesModule {}
