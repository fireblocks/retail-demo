import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Wallet } from './Wallet';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ nullable: true })
  password?: string;

  @OneToOne(() => Wallet, wallet => wallet.user) 
  @JoinColumn() 
  wallet: Wallet;
}
