import { Command, CommandRunner, Option, OptionChoiceFor } from "nest-commander";
import { Role } from "../../../common/enums/role.enum";
import { CreateUserDto } from "../dto";
import { UsersService } from "../services";

@Command({
  name: 'create:admin',
  arguments: '<username> <password>',
  options: { isDefault: true }
})
export class CreateAdminRunner extends CommandRunner {
  constructor(private readonly userService: UsersService) {
    super();
  }
  async run(
    inputs: string[],
    options: Record<string, any>
  ): Promise<void> {
    const payload: CreateUserDto = {
      username: inputs[0],
      password: inputs[1],
      role: Role.ADMIN
    }
    await this.userService.create(payload)
  }
}