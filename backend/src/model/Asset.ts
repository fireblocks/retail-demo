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

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  isSwept: boolean;

  @Column('decimal', { precision: 26, scale: 18, default: 0 })
  balance: number;

  @ManyToOne(() => VaultAccount, (vaultAccount) => vaultAccount.assets)
  vaultAccount: VaultAccount;

  @ManyToOne(() => Wallet, (wallet) => wallet.assets)
  wallet: Wallet;
}
