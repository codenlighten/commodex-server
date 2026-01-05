import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';

@Injectable()
export class IndexerService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private usdtContract: ethers.Contract;
  private requiredConfirmations: number;
  private isRunning = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const usdtAddress = this.configService.get<string>('USDT_CONTRACT_ADDRESS');
    const usdtAbi = [
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'function decimals() view returns (uint8)',
    ];

    this.usdtContract = new ethers.Contract(usdtAddress, usdtAbi, this.provider);
    this.requiredConfirmations = parseInt(
      this.configService.get<string>('REQUIRED_CONFIRMATIONS', '12'),
    );
  }

  async onModuleInit() {
    console.log('📡 Indexer service initialized');
    console.log(`   Required confirmations: ${this.requiredConfirmations}`);
    
    // Start monitoring (in production, use a proper task scheduler)
    // For now, just log that it's ready
    console.log('   Status: Ready to monitor (call /indexer/start to begin)\n');
  }

  /**
   * Start monitoring USDT Transfer events for registered wallets
   */
  async startMonitoring() {
    if (this.isRunning) {
      return { message: 'Already monitoring' };
    }

    this.isRunning = true;
    console.log('🔍 Starting USDT deposit monitoring...\n');

    // Get all registered wallets
    const wallets = await this.prisma.wallet.findMany({
      select: { address: true, id: true },
    });

    if (wallets.length === 0) {
      console.log('⚠️  No wallets registered yet');
      return { message: 'No wallets to monitor' };
    }

    console.log(`Monitoring ${wallets.length} wallet(s):`);
    wallets.forEach((w) => console.log(`  - ${w.address}`));
    console.log('');

    // Listen for Transfer events
    this.usdtContract.on('Transfer', async (from, to, value, event) => {
      // Check if the recipient is one of our wallets
      const wallet = wallets.find((w) => w.address.toLowerCase() === to.toLowerCase());

      if (wallet) {
        await this.handleTransfer(wallet.id, wallet.address, from, value, event);
      }
    });

    return { message: 'Monitoring started', walletsCount: wallets.length };
  }

  /**
   * Handle incoming USDT transfer
   */
  private async handleTransfer(
    walletId: string,
    toAddress: string,
    from: string,
    value: bigint,
    event: any,
  ) {
    const txHash = event.log.transactionHash;
    const logIndex = event.log.index;
    const blockNumber = event.log.blockNumber;

    console.log(`\n💰 USDT Deposit Detected!`);
    console.log(`   To: ${toAddress}`);
    console.log(`   From: ${from}`);
    console.log(`   Amount: ${ethers.formatUnits(value, 6)} USDT`);
    console.log(`   Tx: ${txHash}`);
    console.log(`   Block: ${blockNumber}`);

    // Check if already processed
    const existing = await this.prisma.ledgerEntry.findUnique({
      where: {
        txHash_logIndex: {
          txHash,
          logIndex,
        },
      },
    });

    if (existing) {
      console.log(`   ⚠️  Already processed\n`);
      return;
    }

    // Create pending ledger entry
    await this.prisma.ledgerEntry.create({
      data: {
        walletId,
        asset: 'USDT',
        direction: 'credit',
        amount: value.toString(),
        txHash,
        logIndex,
        blockNumber: BigInt(blockNumber),
        status: 'PENDING',
        description: `USDT deposit from ${from}`,
        metadata: {
          from,
          confirmations: 0,
        },
      },
    });

    console.log(`   ✅ Recorded as PENDING\n`);

    // Start confirmation monitoring
    this.monitorConfirmations(txHash, logIndex);
  }

  /**
   * Monitor confirmations for a transaction
   */
  private async monitorConfirmations(txHash: string, logIndex: number) {
    const checkConfirmations = async () => {
      const entry = await this.prisma.ledgerEntry.findUnique({
        where: { txHash_logIndex: { txHash, logIndex } },
      });

      if (!entry || entry.status === 'FINAL') {
        return;
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - Number(entry.blockNumber);

      if (confirmations >= this.requiredConfirmations) {
        await this.prisma.ledgerEntry.update({
          where: { id: entry.id },
          data: {
            status: 'FINAL',
            metadata: {
              ...(entry.metadata as any),
              confirmations,
              finalizedAt: new Date().toISOString(),
            },
          },
        });

        console.log(`✅ Transaction ${txHash} FINALIZED (${confirmations} confirmations)\n`);
      } else if (confirmations >= 6 && entry.status === 'PENDING') {
        // Upgrade to CONFIRMED after 6 blocks
        await this.prisma.ledgerEntry.update({
          where: { id: entry.id },
          data: {
            status: 'CONFIRMED',
            metadata: {
              ...(entry.metadata as any),
              confirmations,
            },
          },
        });

        console.log(`   📊 Transaction ${txHash} CONFIRMED (${confirmations}/${this.requiredConfirmations})`);
        
        // Continue monitoring
        setTimeout(checkConfirmations, 15000); // Check every 15 seconds
      } else {
        // Continue monitoring
        setTimeout(checkConfirmations, 15000);
      }
    };

    // Start monitoring after 15 seconds
    setTimeout(checkConfirmations, 15000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isRunning) {
      return { message: 'Not currently monitoring' };
    }

    this.usdtContract.removeAllListeners('Transfer');
    this.isRunning = false;

    console.log('🛑 Monitoring stopped\n');
    return { message: 'Monitoring stopped' };
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      requiredConfirmations: this.requiredConfirmations,
    };
  }
}
