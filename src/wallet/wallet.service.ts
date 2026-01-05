import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SafeService } from './safe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private safeService: SafeService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new Safe wallet for a user
   */
  async createMemberSafe(
    userId: string,
    memberPasskeyAddress: string,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get admin signer addresses from config
    const adminSigner1 = this.configService.get<string>('ADMIN_SIGNER_1');
    const adminSigner2 = this.configService.get<string>('ADMIN_SIGNER_2');

    if (!adminSigner1 || !adminSigner2) {
      throw new Error('Admin signers not configured');
    }

    const owners = [memberPasskeyAddress, adminSigner1, adminSigner2];
    const threshold = 2; // 2-of-3

    console.log(`\n🔐 Creating Safe for ${user.name} (${user.email})`);
    console.log(`Owners: ${owners.join(', ')}`);
    console.log(`Threshold: ${threshold}\n`);

    // In production, this would deploy the Safe
    // For now, return deployment instructions
    return {
      instructions: 'Manual Safe deployment required',
      owners,
      threshold,
      steps: [
        '1. Go to https://app.safe.global',
        '2. Connect wallet (use one of the admin addresses)',
        '3. Create new Safe',
        '4. Add all three owners',
        `5. Set threshold to ${threshold}`,
        '6. Deploy',
        '7. Copy the Safe address',
        `8. Call POST /wallet/register with the Safe address`,
      ],
    };
  }

  /**
   * Register an existing Safe address for a user
   */
  async registerSafe(
    userId: string,
    safeAddress: string,
  ): Promise<any> {
    // Verify Safe exists and get its configuration
    const safeInfo = await this.safeService.getSafeInfo(safeAddress);

    // Create wallet record
    const wallet = await this.prisma.wallet.create({
      data: {
        type: 'MEMBER_DEPOSIT',
        address: safeAddress,
        chain: 'ETH',
        ownerType: 'USER',
        ownerId: userId,
        safeOwners: safeInfo.owners,
        safeThreshold: safeInfo.threshold,
      },
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        eventType: 'WALLET_CREATED',
        actor: userId,
        entity: 'Wallet',
        entityId: wallet.id,
        after: {
          address: safeAddress,
          type: 'MEMBER_DEPOSIT',
          owners: safeInfo.owners,
          threshold: safeInfo.threshold,
        },
      },
    });

    console.log(`✅ Safe registered: ${safeAddress}`);
    console.log(`   Owners: ${safeInfo.owners.length}`);
    console.log(`   Threshold: ${safeInfo.threshold}\n`);

    return wallet;
  }

  /**
   * Get user's wallets
   */
  async getUserWallets(userId: string) {
    return this.prisma.wallet.findMany({
      where: {
        ownerType: 'USER',
        ownerId: userId,
      },
      include: {
        ledgerEntries: {
          where: { status: 'FINAL' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Get wallet balance from ledger
   */
  async getWalletBalance(walletId: string): Promise<string> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        walletId,
        status: 'FINAL',
      },
    });

    let balance = BigInt(0);

    for (const entry of entries) {
      const amount = BigInt(entry.amount);
      if (entry.direction === 'credit') {
        balance += amount;
      } else {
        balance -= amount;
      }
    }

    // Return as string to avoid precision loss
    return balance.toString();
  }

  /**
   * Get on-chain USDT balance for a Safe
   */
  async getOnChainBalance(safeAddress: string): Promise<string> {
    return this.safeService.getUSDTBalance(safeAddress);
  }
}
