import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { Wallet } from './Wallet';

@Entity()
export class WalletAssetBalance extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.assetBalances)
  wallet: Wallet;

  @Column()
  assetId: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  totalBalance: number;
  
  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  incomingPendingBalance: number;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  outgoingPendingBalance: number;
}
