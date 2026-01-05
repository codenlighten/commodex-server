import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';

@Injectable()
export class SafeService {
  private provider: ethers.JsonRpcProvider;
  private chainId: number;
  private txServiceUrl: string;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL')!;
    this.chainId = parseInt(this.configService.get<string>('ETHEREUM_CHAIN_ID', '1'));
    this.txServiceUrl = this.configService.get<string>('SAFE_TRANSACTION_SERVICE_URL')!;
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Deploy a new Safe multisig wallet
   * @param owners Array of owner addresses
   * @param threshold Number of required signatures
   * @returns Safe address
   */
  async deploySafe(owners: string[], threshold: number): Promise<string> {
    // For Safe deployment, we need a signer (admin)
    // In production, this should be done via a secure signing service
    // For now, we'll return instructions for manual deployment
    
    console.log('Safe deployment requested:');
    console.log('Owners:', owners);
    console.log('Threshold:', threshold);
    console.log('');
    console.log('⚠️  Manual deployment required:');
    console.log('1. Go to https://app.safe.global');
    console.log(`2. Connect to ${this.chainId === 1 ? 'Ethereum Mainnet' : 'Sepolia Testnet'}`);
    console.log('3. Create new Safe with these owners:', owners.join(', '));
    console.log(`4. Set threshold to ${threshold}`);
    console.log('5. Deploy and copy the Safe address');
    
    // Return placeholder - in production, integrate with Safe deployment service
    throw new Error('Manual Safe deployment required. See console for instructions.');
  }

  /**
   * Get Safe balance for USDT
   */
  async getUSDTBalance(safeAddress: string): Promise<string> {
    const usdtAddress = this.configService.get<string>('USDT_CONTRACT_ADDRESS')!;
    
    const usdtAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];
    
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, this.provider);
    
    const balance = await usdtContract.balanceOf(safeAddress);
    const decimals = await usdtContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Propose a USDT transfer from Safe
   * This creates an unsigned transaction that must be signed by Safe owners
   */
  async proposeUSDTTransfer(
    safeAddress: string,
    to: string,
    amount: string,
  ): Promise<any> {
    const usdtAddress = this.configService.get<string>('USDT_CONTRACT_ADDRESS');
    
    // Create ERC-20 transfer data
    const usdtInterface = new ethers.Interface([
      'function transfer(address to, uint256 amount) returns (bool)',
    ]);
    
    // Parse amount to proper units (USDT has 6 decimals)
    const amountWei = ethers.parseUnits(amount, 6);
    
    const data = usdtInterface.encodeFunctionData('transfer', [to, amountWei]);
    
    // Create Safe transaction proposal
    const safeTransaction = {
      to: usdtAddress,
      value: '0',
      data: data,
      operation: 0, // CALL
    };
    
    console.log('Safe transaction proposal created:');
    console.log('Safe Address:', safeAddress);
    console.log('To:', to);
    console.log('Amount USDT:', amount);
    console.log('');
    console.log('⚠️  Manual signing required:');
    console.log('1. Go to https://app.safe.global');
    console.log(`2. Select Safe: ${safeAddress}`);
    console.log('3. Create new transaction:');
    console.log(`   - To: ${usdtAddress}`);
    console.log(`   - Value: 0 ETH`);
    console.log(`   - Data: ${data}`);
    console.log('4. Get required signatures');
    console.log('5. Execute transaction');
    
    return {
      safeAddress,
      transaction: safeTransaction,
      instructions: 'Manual signing required via Safe app',
    };
  }

  /**
   * Verify a Safe exists and get its configuration
   */
  async getSafeInfo(safeAddress: string): Promise<any> {
    try {
      const safeApiKit = new SafeApiKit({
        chainId: BigInt(this.chainId),
      });
      
      const safeInfo = await safeApiKit.getSafeInfo(safeAddress);
      
      return {
        address: safeAddress,
        owners: safeInfo.owners,
        threshold: safeInfo.threshold,
        nonce: safeInfo.nonce,
      };
    } catch (error) {
      console.error('Error fetching Safe info:', error);
      throw new Error(`Could not fetch Safe info for ${safeAddress}`);
    }
  }
}
