import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule is declared @Global so that PrismaService is available
 * application-wide without each module having to import it explicitly.
 * This mirrors the original behaviour and lets the infrastructure-layer
 * repositories (e.g. PrismaUserRepository) inject PrismaService directly.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
