import {
  ChainSnippet,
  Address,
  EncryptedPrivateKey,
  OrganizationID,
  UnixTimestamp,
  WalletID,
} from "../lib/types";

export interface Wallet {
  id: WalletID;
  organizationID: OrganizationID;
  name: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  deletedAt: UnixTimestamp | null;
  address: Address;
  /**
   * Encrypted private key of the wallet to sign transactions
   */
  encryptedPrivateKey: EncryptedPrivateKey;
  /**
   * Webhook URL that is called when a payment is received
   */
  webhookURL: string;
  /**
   * Encrypted secret that the user passes in to authenticate the webhook
   */
  encryptedWebhookSecret: string | null;
  /**
   * Fee that is charged by the DAO for using the wallet in basis points,
   * i.e. 100% = 10000, 1% = 100, 0.01% = 1
   */
  daoFeeBasisPoints: number;
  /**
   * DAO wallet that receives the fee
   */
  daoFeeRecipient: Address;
  /**
   * End customer wallet address that receives the payment
   */
  endCustomerRecipient: Address;
  /**
   * Details about the chain the wallet is on
   */
  chain: ChainSnippet;
}
