import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetOrganigramaUseCase } from '../../../application/use-cases';

@ApiTags('Organigrama')
@Controller('companies/:companyId/organigrama')
export class OrgNodesController {
  constructor(private readonly getOrganigrama: GetOrganigramaUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get organigrama (nodes and edges for ReactFlow)' })
  async findByCompany(@Param('companyId') companyId: string) {
    return this.getOrganigrama.execute(companyId);
  }
}
