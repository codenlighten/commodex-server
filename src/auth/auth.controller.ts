import { Controller, Post, Body, Session, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/begin')
  async registerBegin(@Body() body: { email: string; name: string }, @Session() session: any) {
    const { user, options } = await this.authService.registerUser(body.email, body.name);
    
    // Store challenge in session for verification
    session.challenge = options.challenge;
    session.userId = user.id;
    
    return options;
  }

  @Post('register/complete')
  @HttpCode(HttpStatus.OK)
  async registerComplete(
    @Body() body: { response: any; deviceName?: string },
    @Session() session: any,
  ) {
    if (!session.challenge || !session.userId) {
      return { error: 'No registration in progress' };
    }

    const result = await this.authService.verifyRegistration(
      session.userId,
      body.response,
      session.challenge,
      body.deviceName,
    );

    // Clear session
    delete session.challenge;
    delete session.userId;

    return result;
  }

  @Post('login/begin')
  async loginBegin(@Body() body: { email: string }, @Session() session: any) {
    const { userId, options } = await this.authService.generateAuthenticationOptions(body.email);
    
    // Store challenge in session
    session.challenge = options.challenge;
    session.userId = userId;
    
    return options;
  }

  @Post('login/complete')
  @HttpCode(HttpStatus.OK)
  async loginComplete(@Body() body: { response: any }, @Session() session: any) {
    if (!session.challenge || !session.userId) {
      return { error: 'No login in progress' };
    }

    const result = await this.authService.verifyAuthentication(
      session.userId,
      body.response,
      session.challenge,
    );

    // Clear session
    delete session.challenge;
    delete session.userId;

    return result;
  }
}
