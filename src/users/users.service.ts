import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    let user: User;

    if (loginUserDto.email) {
      user = await this.userRepository.findOne({
        where: { email: loginUserDto.email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Користувача з таким email не знайдено');
    }

    if (
      user &&
      (await bcryptjs.compare(loginUserDto.password, user.password))
    ) {
      return {
        message: `user with id ${user.id} successfully logged in`,
        user,
      };
    }

    throw new UnauthorizedException('Не вірний пароль');
  }

  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: registerUserDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('Користувач з такою потштою вже існує');
    }

    const hashedPassword = await bcryptjs.hash(registerUserDto.password, 10);

    const user = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
