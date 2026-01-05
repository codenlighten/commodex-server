import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('create')
  async createWallet(
    @GetUser() user: User,
    @Body() body: { passkeyAddress: string },
  ) {
    return this.walletService.createMemberSafe(user.id, body.passkeyAddress);
  }

  @Post('register')
  async registerWallet(
    @GetUser() user: User,
    @Body() body: { safeAddress: string },
  ) {
    return this.walletService.registerSafe(user.id, body.safeAddress);
  }

  @Get('my-wallets')
  async getMyWallets(@GetUser() user: User) {
    const wallets = await this.walletService.getUserWallets(user.id);

    // Enrich with balances
    const enriched = await Promise.all(
      wallets.map(async (wallet) => {
        const ledgerBalance = await this.walletService.getWalletBalance(wallet.id);
        const onChainBalance = await this.walletService.getOnChainBalance(wallet.address);

        return {
          ...wallet,
          ledgerBalance,
          onChainBalance,
        };
      }),
    );

    return enriched;
  }

  @Get('balance/:walletId')
  async getBalance(@Body() body: { walletId: string }) {
    return {
      ledgerBalance: await this.walletService.getWalletBalance(body.walletId),
    };
  }
}
