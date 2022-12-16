import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index, OneToOne } from "typeorm";
import { Point } from "geojson";
import { Farm } from "modules/farms/entities/farm.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: false
  })
  public coordinates: Point;

  @Column({ nullable: false })
  public address: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
  
  @OneToOne(() => Farm, (farm) => farm.owner, { onDelete: "SET NULL", nullable: true })
  public farm?: Farm;
}
