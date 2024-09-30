import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { VaultAccount } from './VaultAccount';
import { Wallet } from './Wallet';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  createdAt: string
  
  @Column()
  assetId: string;

  @Column( {default: false} )
  outgoing: boolean;
  
  @Column()
  status: string;

  @Column()
  fireblocksTxId: string;

  @Column({nullable: true})
  txHash: string;

  @Column()
  amount: string;

  @Column({ default: false })
  isSweeping?: boolean;

  @ManyToOne(() => VaultAccount, vaultAccount => vaultAccount.sourceTransactions, { nullable: true })
  sourceVaultAccount?: VaultAccount;

  @ManyToOne( () => Wallet, wallet => wallet.transactions)
  wallet: Wallet

  @ManyToOne(() => VaultAccount, vaultAccount => vaultAccount.destinationTransactions, { nullable: true })
  destinationVaultAccount?: VaultAccount;

  @Column({ nullable: true })
  sourceExternalAddress?: string;

  @Column( { nullable: true})
  externalTxId?: string;

  @Column({ nullable: true })
  destinationExternalAddress?: string;
}
