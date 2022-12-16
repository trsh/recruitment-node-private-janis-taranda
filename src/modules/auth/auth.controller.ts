import { IsString } from "class-validator";
import { UnprocessableEntityError } from "errors/errors";
import { Body, JsonController, Post } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { AccessToken } from "./entities/access-token.entity";


export class AuthResponse {
  @IsString()
  public token: string;

  constructor(accessToken: AccessToken) {
    this.token = accessToken.token;
  }
}

@JsonController("/auth")
@OpenAPI({ security: [{ basicAuth: [] }] })
export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  @Post("/login")
  @ResponseSchema(AuthResponse)
  public async login(@Body() body: LoginUserDto): Promise<AuthResponse | null> {
    const accessToken = await this.authService.login(body);

    if (accessToken) {
      return new AuthResponse(accessToken);
    }

    throw new UnprocessableEntityError("Could not create access token")
  }
}
