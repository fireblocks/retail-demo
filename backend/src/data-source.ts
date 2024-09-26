import "reflect-metadata"
import { DataSource } from "typeorm"
import { Wallet, WalletAssetBalance, Asset, VaultAccount, SupportedAsset, User, Transaction } from "@model"
import { createLogger } from "@util/logger.utils"


const logger = createLogger('<DataSource>');

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "retail_demo",
  synchronize: true,
  logging: false,
  entities: [Wallet, WalletAssetBalance, Asset, VaultAccount, SupportedAsset, User, Transaction],
  migrations: [],
  subscribers: [],
})

export async function initializeDataSource(maxRetries = 10, retryInterval = 2000): Promise<DataSource> {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      await AppDataSource.initialize();
      logger.info("Data Source has been initialized!");
      return AppDataSource;
    } catch (err) {
      logger.error("Error during Data Source initialization", err);
      retries -= 1;
      logger.info(`Retrying in ${retryInterval / 1000} seconds... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, retryInterval));
    }
  }
  throw new Error("Failed to initialize Data Source after multiple retries");
}
