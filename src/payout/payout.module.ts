import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
