import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { VaultAccount } from './VaultAccount';
import { Wallet } from './Wallet';

@Entity()
export class Asset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assetId: string;

  @Column()
  assetName: string;

  @Column({ default: 'https://default.explorer' })
  explorerUrl: string;

  @Column({ default: 'https://default.logo' })
  logoUrl: string;

  @Column({ nullable: true })
  address: string;

  @Column({nullable: true})
  isSwept: boolean

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  balance: number;

  @ManyToOne(() => VaultAccount, (vaultAccount) => vaultAccount.assets)
  vaultAccount: VaultAccount;

  @ManyToOne(() => Wallet, (wallet) => wallet.assets)
  wallet: Wallet;
}
