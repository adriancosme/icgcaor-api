import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  email!: string;
  @ApiProperty()
  @Prop({ required: true, length: 20 })
  username: string;
  @ApiProperty()
  @Prop({
    length: 500,
    select: false,
  })
  password: string;
  @ApiProperty()
  @Prop({ default: true })
  enabled: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }
  // generate a salt
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(this.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      this.password = hash;
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
