import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SafeService } from '../wallet/safe.service';

@Injectable()
export class PayoutService {
  constructor(
    private prisma: PrismaService,
    private safeService: SafeService,
  ) {}

  /**
   * Create a payout request (withdrawal)
   */
  async createPayoutRequest(
    requesterId: string,
    toAddress: string,
    amount: string,
    purpose: string,
  ) {
    // Basic validation
    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid Ethereum address');
    }

    const request = await this.prisma.payoutRequest.create({
      data: {
        requesterId,
        toAddress,
        amount,
        purpose,
        status: 'SUBMITTED',
        policyChecks: {
          addressValidated: true,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        eventType: 'PAYOUT_REQUESTED',
        actor: requesterId,
        entity: 'PayoutRequest',
        entityId: request.id,
        after: {
          toAddress,
          amount,
          purpose,
        },
      },
    });

    console.log(`\n💸 Payout request created:`);
    console.log(`   ID: ${request.id}`);
    console.log(`   To: ${toAddress}`);
    console.log(`   Amount: ${amount} USDT`);
    console.log(`   Status: Awaiting approval\n`);

    return request;
  }

  /**
   * Placeholder for future approval system
   */
  async getPayoutRequests(userId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
