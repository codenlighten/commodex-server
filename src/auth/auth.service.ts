import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';

@Injectable()
export class AuthService {
  private rpName: string;
  private rpID: string;
  private origin: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.rpName = this.configService.get('RP_NAME', 'RevelNation Secure Wallet');
    this.rpID = this.configService.get('RP_ID', 'localhost');
    this.origin = this.configService.get('RP_ORIGIN', 'http://localhost:3000');
  }

  async registerUser(email: string, name: string) {
    // Check if user already exists
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role: 'MEMBER',
        },
      });
      
      // Audit log
      await this.prisma.auditEvent.create({
        data: {
          eventType: 'USER_CREATED',
          actor: user.id,
          entity: 'User',
          entityId: user.id,
          after: { email, name },
        },
      });
    }

    // Generate passkey registration options
    const opts = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: Buffer.from(user.id),
      userName: email,
      userDisplayName: name,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    return { user, options: opts };
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    expectedChallenge: string,
    deviceName?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new UnauthorizedException('Verification failed');
    }

    const { credential } = verification.registrationInfo;
    const credentialPublicKey = credential.publicKey;
    const credentialID = credential.id;
    const counter = credential.counter;

    // Store the passkey
    await this.prisma.passkeyCredential.create({
      data: {
        userId: user.id,
        credentialID: typeof credentialID === 'string' ? credentialID : Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter: BigInt(counter),
        deviceName: deviceName || 'Default Device',
      },
    });

    // Generate JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { verified: true, token, user };
  }

  async generateAuthenticationOptions(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });

    if (!user || user.passkeys.length === 0) {
      throw new UnauthorizedException('No passkeys found for this email');
    }

    const opts = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: user.passkeys.map((passkey) => ({
        id: passkey.credentialID,
        type: 'public-key' as const,
      })),
      userVerification: 'preferred',
    });

    return { userId: user.id, options: opts };
  }

  async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const credentialID = response.id;
    const passkey = user.passkeys.find(
      (p) => p.credentialID === credentialID,
    );

    if (!passkey) {
      throw new UnauthorizedException('Passkey not found');
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(Buffer.from(passkey.credentialPublicKey, 'base64url')),
        counter: Number(passkey.counter),
      },
    });

    if (!verification.verified) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Update counter and last used
    await this.prisma.passkeyCredential.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsed: new Date(),
      },
    });

    // Generate JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { verified: true, token, user };
  }
}
