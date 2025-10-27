import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { IErrorsTypeORM } from 'src/common/interfaces/errors.interfaces';

import { CreateUserDto, LoginUserDto, RolDto } from './dto';
import { User } from './entities/auth.entity';

import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async singUp(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        nombre: createUserDto.nombre,
        rol: createUserDto.rol,
        email: createUserDto.email,
        password: bcrypt.hashSync(password, 10),
        username: createUserDto.username,
        apellido: createUserDto.apellido,
        telefono: createUserDto.telefono,
      });
      await this.userRepository.save(user);
      delete user.password;
      //delete user.id;
      delete user.isActive;
      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (err) {
      this.handerDBException(err);
    }
  }
  async singIn(loginUserDto: LoginUserDto) {
    try {
      const { password, username } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { username },
        //relations: ['disponibilidades'],
      });
      if (!user) throw new UnauthorizedException(`Credenciales no son validas`);

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException(`Credenciales no son validas`);

      delete user.password;
      delete user.fecha_creacion;
      delete user.fecha_actualizacion;
      delete user.isActive;

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (err) {
      this.handerDBException(err);
    }
  }
  async checkAuthStatus(user: User) {
    delete user.password;
    delete user.fecha_creacion;
    delete user.fecha_actualizacion;
    delete user.isActive;

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
  private handerDBException(error: IErrorsTypeORM): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
