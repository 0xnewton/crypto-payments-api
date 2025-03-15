import { Wallet } from "../types";
import { WebhookReceipt } from "../../webhooks/types";
import {
  gasWalletAddressAndPrivateKey,
  getProviderForChain,
} from "../../lib/core";
import { ethers } from "ethers";
import { logger } from "firebase-functions";
import { decryptWalletPrivateKey } from "../../lib/core/encryt";

interface TransferFundsToDaoAndReceivingAddressParams {
  wallet: Wallet;
  webhookReceipt: WebhookReceipt;
}

/**
 * This function performs the following steps:
 * 1. Uses the gas wallet to top‑up the sender’s wallet with native funds.
 * 2. Uses the sender’s wallet (with gas) to perform two token transfers:
 *    - Transfer the DAO fee portion to the DAO fee recipient.
 *    - Transfer the remaining tokens to the recipient.
 * 3. Refunds any leftover native funds (dust) from the sender’s wallet back to the gas wallet.
 */
export const transferFundsToDaoAndReceivingAddress = async (
  params: TransferFundsToDaoAndReceivingAddressParams
) => {
  logger.info("Transferring funds to DAO and receiving address", { params });
  // Retrieve gas wallet credentials (format expected: "address::privateKey")
  const gasWalletValue = gasWalletAddressAndPrivateKey.value();
  const [gasWalletAddress, gasWalletPrivateKey] = gasWalletValue.split("::");
  if (!gasWalletAddress || !gasWalletPrivateKey) {
    throw new Error("Gas wallet address and private key not found");
  }

  // Set up provider for the target chain
  const provider = getProviderForChain(params.webhookReceipt.chain);

  // Create a signer for the gas wallet
  const gasWalletSigner = new ethers.Wallet(gasWalletPrivateKey, provider);

  // --- Step 1: Estimate Gas Required for the Two ERC20 Transfers ---
  // rawValue is assumed to be a hex string representing the token amount in the smallest unit
  const tokenAmount = BigInt(params.webhookReceipt.rawValue);
  // Calculate DAO fee and the remaining token amount
  const fee =
    (tokenAmount * BigInt(params.wallet.daoFeeBasisPoints)) / BigInt(10000);
  const amountToRecipient = tokenAmount - fee;

  // Minimal ERC20 ABI to interact with transfer function.
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) external returns (bool)",
  ];
  const tokenContract = new ethers.Contract(
    params.webhookReceipt.contractAddress,
    ERC20_ABI,
    provider
  );

  // Estimate gas for each token transfer.
  // Use bracket notation on the estimateGas object.
  const gasEstimateDao = await (tokenContract.estimateGas as any)[
    "transfer(address,uint256)"
  ](params.wallet.daoFeeRecipient, fee);
  const gasEstimateRecipient = await (tokenContract.estimateGas as any)[
    "transfer(address,uint256)"
  ](params.wallet.recipientAddress, amountToRecipient);

  // Sum the gas estimates for the two transactions.
  const totalGasEstimate = gasEstimateDao + gasEstimateRecipient;
  logger.info("Total gas estimate", {
    totalGasEstimate,
    gasEstimateDao,
    gasEstimateRecipient,
  });

  // Get current gas fee data.
  const feeData = await provider.getFeeData();
  if (!feeData.gasPrice) throw new Error("Gas price is not available");
  const gasPrice = feeData.gasPrice;

  // Calculate the total cost: (totalGasEstimate * gasPrice) with a 1.5x margin.
  // Using integer math with a margin multiplier of 3/2.
  const totalCost = totalGasEstimate * gasPrice;
  const marginMultiplier = BigInt(3);
  const topUpAmount = (totalCost * marginMultiplier) / BigInt(2);
  logger.info("Top-up amount", { topUpAmount });

  // --- Step 2: Top-Up the Sender's Wallet ---
  logger.info("Sending top-up transaction to sender's wallet", {
    topUpAmount,
    gasWalletAddress,
    senderAddress: params.wallet.address,
  });
  const topUpTx = await gasWalletSigner.sendTransaction({
    to: params.wallet.address,
    value: topUpAmount,
  });
  const topUpReceipt = await topUpTx.wait();
  if (!topUpReceipt?.status) throw new Error("Top-up transaction failed");

  // --- Step 3: Execute Token Transfers Using the Sender's Wallet ---
  // Replace with your actual decryption logic to obtain the sender's private key.
  const decryptedPrivateKey = await decryptWalletPrivateKey(
    params.wallet.encryptedPrivateKey
  );
  const senderWallet = new ethers.Wallet(decryptedPrivateKey, provider);

  const tokenContractWithSender = tokenContract.connect(senderWallet);
  // You can either use the fixed gas limit or use the estimates you already got.
  const gasLimit = BigInt("100000");

  // Send DAO fee transfer.
  logger.info("Sending DAO fee transfer", {
    daoFeeRecipient: params.wallet.daoFeeRecipient,
    fee,
  });
  const daoTxResponse = await (tokenContractWithSender as any).transfer(
    params.wallet.daoFeeRecipient,
    fee,
    {
      gasLimit,
      gasPrice,
    }
  );
  const daoReceipt = await daoTxResponse.wait();

  logger.info("Sending recipient transfer", {
    recipientAddress: params.wallet.recipientAddress,
    amountToRecipient,
  });

  // Send remaining tokens to recipient.
  const recipientTxResponse = await (tokenContractWithSender as any).transfer(
    params.wallet.recipientAddress,
    amountToRecipient,
    {
      gasLimit,
      gasPrice,
    }
  );
  const recipientReceipt = await recipientTxResponse.wait();
  logger.info("Token transfers completed", {
    daoTxHash: daoReceipt.hash,
    recipientTxHash: recipientReceipt.hash,
  });

  return {
    topUpTxHash: topUpReceipt.hash,
    daoTxHash: daoReceipt.hash,
    recipientTxHash: recipientReceipt.hash,
  };
};
