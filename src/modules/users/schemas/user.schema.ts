import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../../common/enums/role.enum';
export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  username!: string;

  @ApiProperty()
  @Prop({
    length: 500,
  })
  password: string;

  @ApiProperty()
  @Prop({ default: true })
  enabled: boolean;

  @ApiProperty()
  @Prop({ type: String, default: Role.USER })
  role: Role;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    next();
  }
  // generate a salt
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
