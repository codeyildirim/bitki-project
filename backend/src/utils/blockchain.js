import { Web3 } from 'web3';

const CRYPTO_ADDRESSES = {
  bitcoin: process.env.BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ethereum: process.env.ETH_ADDRESS || '0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2',
  bnb: process.env.BNB_ADDRESS || '0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2'
};

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.initWeb3();
  }

  async initWeb3() {
    try {
      // BSC Mainnet RPC (ücretsiz)
      const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
      this.web3 = new Web3(rpcUrl);
    } catch (error) {
      console.error('Blockchain bağlantı hatası:', error);
    }
  }

  getCryptoAddresses() {
    return CRYPTO_ADDRESSES;
  }

  async verifyTransaction(txHash, expectedAmount, cryptoType = 'bnb') {
    try {
      if (!this.web3) {
        throw new Error('Web3 bağlantısı mevcut değil');
      }

      const transaction = await this.web3.eth.getTransaction(txHash);
      if (!transaction) {
        return { valid: false, message: 'İşlem bulunamadı' };
      }

      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      if (!receipt || !receipt.status) {
        return { valid: false, message: 'İşlem başarısız' };
      }

      const valueInEther = this.web3.utils.fromWei(transaction.value, 'ether');
      const expectedAddress = CRYPTO_ADDRESSES[cryptoType];

      if (transaction.to.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { valid: false, message: 'Yanlış adrese gönderilmiş' };
      }

      if (parseFloat(valueInEther) < expectedAmount) {
        return { valid: false, message: 'Yetersiz tutar' };
      }

      return {
        valid: true,
        amount: valueInEther,
        from: transaction.from,
        to: transaction.to,
        blockNumber: transaction.blockNumber
      };
    } catch (error) {
      console.error('İşlem doğrulama hatası:', error);
      return { valid: false, message: 'Doğrulama hatası: ' + error.message };
    }
  }

  convertCurrency(amount, fromCurrency = 'TRY', toCurrency = 'USD') {
    const rates = {
      'TRY_TO_USD': 0.037,
      'USD_TO_BNB': 0.0032,
      'USD_TO_ETH': 0.0004,
      'USD_TO_BTC': 0.000023
    };

    let usdAmount = amount;
    if (fromCurrency === 'TRY') {
      usdAmount = amount * rates.TRY_TO_USD;
    }

    switch (toCurrency) {
      case 'BNB':
        return (usdAmount * rates.USD_TO_BNB).toFixed(6);
      case 'ETH':
        return (usdAmount * rates.USD_TO_ETH).toFixed(6);
      case 'BTC':
        return (usdAmount * rates.USD_TO_BTC).toFixed(8);
      default:
        return usdAmount.toFixed(2);
    }
  }
}

export default new BlockchainService();