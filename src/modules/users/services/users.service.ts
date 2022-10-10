import { Injectable, NotFoundException, BadGatewayException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/common/interfaces';

import { CreateUserDto, UpdateUserDto } from '../dto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

  /**
   * Get all users from database
   * @returns User[]
   */
  async getAll() {
    const fieldsExcluded = { password: 0, __v: 0 }
    return await this.userModel.find({}, fieldsExcluded);
  }

  /**
   * Get user by id
   * @param id User id
   */
  async getOneById(id: string): Promise<User | null> {
    return (
      (await this.userModel.findOne({ _id: id }).catch((err) => {
        throw new BadGatewayException('Something happened', err);
      })) || null
    );
  }

  /**
   * Get by username or email
   * @param data { username: string, email: string }
   */
  async getByUser(data: { email?: string }): Promise<User> {
    const user = await this.userModel.findOne(data).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
    if (!user) {
      return null;
    }
    return user.toObject();
  }

  /**
   * Create users in batch
   * @param dto Array of CreateUserDto
   */
  async createBatch(dto: CreateUserDto[]): Promise<User[]> {
    const users = await this.userModel.insertMany(dto).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
    for (const res of users) {
      delete res.password;
    }
    return users;
  }

  /**
   * Get users by ids
   * @param ids Get user by array of Ids
   */
  async getByIds(ids: number[]): Promise<User[]> {
    return await this.userModel.findOne({ _id: { $in: ids } });
  }

  /**
   * Create user
   * @param dto CreateUserDto
   */
  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create(dto);
    const newUser = user.toObject<User>();
    delete newUser.password;
    return newUser;
  }

  /**
   * Update an user
   * @param dto UpdateUserDto
   */
  async update(dto: UpdateUserDto): Promise<User> {
    if (!dto._id) {
      throw new BadRequestException('You need to provide a valid id');
    }
    const user = await this.userModel.findById(dto._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.username = dto.username;
    user.role = dto.role;
    if (dto.password) {
      user.password = dto.password
    }
    user.save();
    const userWithoutPass = {} as User
    Object.assign(userWithoutPass, user)
    delete userWithoutPass.password;
    return userWithoutPass;
  }

  /**
   * Update users in batch
   * @param dtos Array of UpdateUserDto
   */
  async updateMany(dtos: UpdateUserDto[]): Promise<User[]> {
    const updatedUsers: User[] = [];
    for (const dto of dtos) {
      if (dto._id) {
        const user = await this.userModel.findOneAndUpdate({ _id: dto._id }, dto);
        if (!!user) {
          delete dto._id; // Deleting this input to avoid issues with entity
          const editedUser = Object.assign(user, dto);
          updatedUsers.push(editedUser);
        }
      }
    }
    return updatedUsers;
  }

  /**
   * Soft delete an user by id
   * @param id User id
   */
  async delete(id: string) {
    const user = await this.userModel.findOneAndDelete({ _id: id }).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
    return user;
  }

  /**
   * Disable an user
   * @param id User id
   */
  async disable(id: string) {
    return await this.userModel.findOneAndUpdate({ _id: id }, { enabled: false }).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
  }

  /**
   * Enable user by id
   * @param id User id
   */
  async enable(id: number) {
    return await this.userModel.findOneAndUpdate({ _id: id }, { enabled: true }).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
  }

  /**
   * Enable users in batch by ids
   * @param ids Array of user ids
   */
  async enableMany(ids: number[]) {
    return await this.userModel.updateMany({ _id: { $in: ids } }, { enabled: true }).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
  }

  /**
   * Disable users in batch by ids
   * @param ids Array of user ids
   */
  async disableMany(ids: number[]) {
    return await this.userModel.updateMany({ _id: { $in: ids } }, { enabled: false }).catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
  }
}
