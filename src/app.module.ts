import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { IndexerModule } from './indexer/indexer.module';
import { PayoutModule } from './payout/payout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    WalletModule,
    IndexerModule,
    PayoutModule,
  ],
})
export class AppModule {}
