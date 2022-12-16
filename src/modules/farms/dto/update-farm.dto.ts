import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateFarmDto {
  @IsString()
  @IsOptional()
  public name?: string;

  @IsString()
  @IsOptional()
  public address?: string;

  @IsNumber()
  @IsOptional()
  public size?: number;

  @IsNumber()
  @IsOptional()
  public theYield?: number;

  public userId?: string;
}
