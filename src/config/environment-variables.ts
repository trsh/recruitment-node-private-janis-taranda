import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  public NODE_ENV: string;

  @IsNumber()
  @IsNotEmpty()
  public APP_PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  public APP_HOST: string = "localhost";

  @IsString()
  @IsNotEmpty()
  public DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  public DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  public DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  public DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  public DB_NAME: string;

  @IsNumber()
  @IsNotEmpty()
  public SALT_ROUNDS: number;

  @IsString()
  @IsNotEmpty()
  public JWT_SECRET: string;

  @IsNumber()
  @IsNotEmpty()
  public JWT_EXPIRES_AT: number;

  @IsString()
  @IsNotEmpty()
  public GOOGLE_MAPS_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  public API_VERSION: string;

  @IsString()
  @IsNotEmpty()
  public SWAGGER_SUPER_USER_NAME: string;

  @IsString()
  @IsNotEmpty()
  public SWAGGER_SUPER_USER_PASS: string;

  @IsString()
  @IsIn(["http", "https"])
  @IsNotEmpty()
  public APP_PROTOCOL: "http" | "https";
}
