import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Asset,
  SupportedAsset,
  Transaction,
  User,
  VaultAccount,
  Wallet,
  WalletAssetBalance,
} from './model';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Asset,
    VaultAccount,
    Transaction,
    SupportedAsset,
    Wallet,
    WalletAssetBalance,
  ],
  migrations: [],
});
