import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './infrastructure/http/modules/companies.module';
import { PositionsModule } from './infrastructure/http/modules/positions.module';
import { SalariesModule } from './infrastructure/http/modules/salaries.module';
import { CommentsModule } from './infrastructure/http/modules/comments.module';
import { OrgNodesModule } from './infrastructure/http/modules/org-nodes.module';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    PositionsModule,
    SalariesModule,
    CommentsModule,
    OrgNodesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
