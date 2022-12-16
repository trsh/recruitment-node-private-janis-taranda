import { IsUUID, IsEmail, IsString, ValidateNested } from "class-validator";
import { UnprocessableEntityError } from "errors/errors";
import { BaseController } from "modules/common/base.controller";
import { CoordinatesResponse } from "modules/common/responses";
import {
  Authorized, Body, JsonController, Post,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import dataSource from "orm/orm.config";

export class UserResponse {
  @IsUUID()
  public id: string;
  @IsEmail()
  public email: string;
  @ValidateNested()
  public coordinates: CoordinatesResponse;
  @IsString()
  public address: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.address = user.address;
    this.coordinates = {
      lat: user.coordinates.coordinates[1],
      lng: user.coordinates.coordinates[0]
    };
  }
}

@Authorized()
@JsonController("/users")
@OpenAPI({ security: [{ basicAuth: [] }] })
export class UsersController extends BaseController {
  private readonly usersService: UsersService;

  constructor() {
    super();
    this.usersService = new UsersService();
  }

  @Post()
  @ResponseSchema(UserResponse)
  public async create(@Body() body: CreateUserDto): Promise<UserResponse> {
    return dataSource.transaction<UserResponse>(async (transactionalEM) => {
      const user = await this.usersService.createUser(body, transactionalEM);

      if (user) {
        return new UserResponse(user);
      }

      throw new UnprocessableEntityError("Could not create user")
    });
  }
}
