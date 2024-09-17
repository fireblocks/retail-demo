import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';


@Entity()
export class SupportedAsset extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  explorerUrl: string;

  @Column()
  logoUrl: string;

  @Column()
  assetId: string
}
