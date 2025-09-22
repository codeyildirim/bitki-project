import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CryptoPayment = ({ order, paymentMethod, onPaymentComplete }) => {
  const [txHash, setTxHash] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [web3Connected, setWeb3Connected] = useState(false);

  // Web3 wallet bağlantısı
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // MetaMask bağlantısı
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
          setWeb3Connected(true);

          // Network kontrolü
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          });

          // Ethereum Mainnet: 0x1
          if (paymentMethod.type === 'eth' && chainId !== '0x1') {
            alert('Lütfen Ethereum Mainnet ağına geçin');
          }
        }
      } catch (error) {
        console.error('Wallet bağlantı hatası:', error);
        alert('Wallet bağlantısı başarısız');
      }
    } else {
      alert('MetaMask yüklü değil!');
    }
  };

  // Kripto ödemesi gönder
  const sendCryptoPayment = async () => {
    if (!web3Connected) {
      alert('Önce cüzdanınızı bağlayın');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (paymentMethod.type === 'eth') {
        // ETH transferi
        const transactionParams = {
          from: accounts[0],
          to: paymentMethod.details.address,
          value: '0x' + Math.floor(order.total_amount * 0.0003 * 10**18).toString(16), // Örnek dönüşüm
          gas: '0x5208' // 21000
        };

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParams]
        });

        setTxHash(txHash);
        onPaymentComplete(txHash);
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      alert('Ödeme işlemi başarısız');
    }
  };

  // Adres kopyalama
  const copyAddress = () => {
    navigator.clipboard.writeText(paymentMethod.details.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Network göstergesi
  const getNetworkBadge = () => {
    switch (paymentMethod.type) {
      case 'btc':
        return <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Bitcoin</span>;
      case 'eth':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Ethereum</span>;
      case 'usdt_trc20':
        return <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Tron (TRC-20)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {paymentMethod.title} ile Ödeme
          </h3>
          {getNetworkBadge()}
        </div>

        {/* Tutar bilgisi */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ödenecek Tutar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.total_amount} ₺
            </p>
            {paymentMethod.type === 'eth' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ≈ {(order.total_amount * 0.0003).toFixed(4)} ETH
              </p>
            )}
          </div>
        </div>

        {/* QR Code ve Adres */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={paymentMethod.details.address}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              QR kodu tarayarak ödeme yapabilirsiniz
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {paymentMethod.title} Adresi
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={paymentMethod.details.address}
                  readOnly
                  className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={copyAddress}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ağ / Network
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {paymentMethod.details.network}
              </p>
            </div>

            {paymentMethod.type === 'usdt_trc20' && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Sadece TRC-20 ağı üzerinden USDT gönderin!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Web3 Bağlantı */}
        {(paymentMethod.type === 'eth' || paymentMethod.type === 'usdt_erc20') && (
          <div className="mt-6 border-t pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Otomatik Ödeme (MetaMask)
            </h4>

            {!web3Connected ? (
              <button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                🦊 MetaMask Bağla
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    ✓ Cüzdan bağlı
                  </p>
                </div>
                <button
                  onClick={sendCryptoPayment}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ödemeyi Gönder
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manuel İşlem Hash */}
        <div className="mt-6 border-t pt-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Manuel Ödeme Bildirimi
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="İşlem hash/ID'sini girin"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
            <button
              onClick={() => onPaymentComplete(txHash)}
              disabled={!txHash || isChecking}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Kontrol Ediliyor...' : 'Ödemeyi Bildir'}
            </button>
          </div>
        </div>

        {/* Uyarılar */}
        <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Minimum {paymentMethod.details.min_confirmation} onay gereklidir</p>
          <p>• Yanlış ağ kullanımında kayıplar oluşabilir</p>
          <p>• Ödeme sonrası işlem hash'ini kaydedin</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoPayment;