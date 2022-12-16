import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from "typeorm";
import { Point } from "geojson";
import { User } from "modules/users/entities/user.entity";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public name: string;

  @Column({ nullable: false })
  public address: string;

  @Column({ nullable: false, type: "decimal" })
  public size: number;

  @Column({ nullable: false, type: "decimal" })
  public theYield: number;

  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: false
  })
  public coordinates: Point;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => User, (user) => user.farm, { onDelete: "NO ACTION", onUpdate: "NO ACTION", nullable: true })
  @JoinColumn()
  public owner?: User;

  public ownerId?: string;
  public distance: number = -1;
}
