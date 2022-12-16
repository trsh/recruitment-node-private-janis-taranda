import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

type SortNameOptionsT<T> = keyof T;
export type SortNameOptions<T> = SortNameOptionsT<T>[];

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC"
}

export abstract class FetchListQuery<S> {
  @IsNumber()
  @IsNotEmpty()
  public page: number;

  @IsNumber()
  @IsNotEmpty()
  public abstract pageSize: number;

  public getOffset(): number {
    return (this.pageSize * this.page) - this.pageSize
  }

  @IsArray()
  @Type(() => String)
  @IsOptional()
  public abstract sortByNames?: SortNameOptions<S>;

  @IsArray()
  @IsEnum(SortDirection, { each: true }) // TODO: switch to IsIn, better error msg
  @Type(() => String)
  @IsOptional()
  public sortByDirections?: String[];
}
