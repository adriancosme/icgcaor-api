import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';

import { UsersService } from '../users/services';
import { PATTERN_VALID_EMAIL } from '../../config/config.constants';
import { User } from '../users/schemas/user.schema';

export interface ApiLoginSuccess {
  user: Partial<User>;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) { }

  async validateUser(userData: string, password: string): Promise<Partial<User>> {    
    // Verify if userData is email or username
    const data: { username?: string; email?: string } = {};
    !PATTERN_VALID_EMAIL.test(userData) ? (data.username = userData) : (data.email = userData);
    const user = await this.usersService.getByUser(data);
    if (!user) {
      throw new NotFoundException('Your account does not exist');
    }
    if (!user.enabled) {
      throw new ForbiddenException('Account is disabled, contact with administrator');
    }
    const isMatch = compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    delete user.password;
    return user;
  }

  async login(user: Partial<User>): Promise<ApiLoginSuccess> {
    const payload: JwtPayload = { username: user.username, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      user,
      accessToken,
    };
  }

  public async renewToken(token: string): Promise<ApiLoginSuccess> {
    try {
      const decode = this.jwtService.decode(token) as Partial<User>;
      const data: { username?: string; email?: string } = {};
      if (!decode) {
        throw new UnauthorizedException();
      }
      data.username = decode.username
      const user = await this.usersService.getByUser(data)
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.generateToken(user);

    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
  async generateToken(user: User): Promise<ApiLoginSuccess> {
    const payload: JwtPayload = { username: user.username, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    delete user.password;
    return {
      user,
      accessToken,
    };
  }
}
