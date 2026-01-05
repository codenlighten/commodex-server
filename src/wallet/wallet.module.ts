import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { SafeService } from './safe.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, SafeService],
  exports: [WalletService, SafeService],
})
export class WalletModule {}
