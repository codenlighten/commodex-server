import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    // Prisma 7: Pass datasourceUrl directly to constructor
    const databaseUrl = configService.get<string>('DATABASE_URL')!;
    super({
      datasourceUrl: databaseUrl,
    } as any); // Type assertion for Prisma 7 compatibility
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
