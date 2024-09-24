import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class SupportedAsset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  explorerUrl: string;

  @Column()
  fireblocksAssetId: string

  @Column({default: 0})
  depositsCounter: number;
  
  @Column()
  name: string
}
