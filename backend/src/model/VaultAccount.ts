import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { User } from './User';
import { Asset } from './Asset';
import { Transaction } from './Transaction';

@Entity()
export class VaultAccount extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fireblocksVaultId: string;

  @Column()
  name: string;

  @OneToMany(() => Asset, (asset) => asset.vaultAccount)
  assets: Asset[];

  @Column({ default: '0' })
  balance: string;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceVaultAccount)
  sourceTransactions: Transaction[];

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.destinationVaultAccount
  )
  destinationTransactions: Transaction[];
}
