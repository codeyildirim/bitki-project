import { responseSuccess, responseError, generateOrderNumber } from '../utils/helpers.js';
import blockchainService from '../utils/blockchain.js';
import db from '../models/database.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json(responseError('Sipariş ürünleri gereklidir'));
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone ||
        !shippingAddress.city || !shippingAddress.district || !shippingAddress.address) {
      return res.status(400).json(responseError('Teslimat adresi bilgileri eksik'));
    }

    if (!paymentMethod || !['iban', 'crypto'].includes(paymentMethod)) {
      return res.status(400).json(responseError('Geçerli ödeme yöntemi seçiniz'));
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [item.productId]);
      if (!product) {
        return res.status(400).json(responseError(`Ürün bulunamadı: ${item.productId}`));
      }

      if (product.stock < item.quantity) {
        return res.status(400).json(responseError(`Yetersiz stok: ${product.name}`));
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const orderNumber = generateOrderNumber();
    const shippingAddressJson = JSON.stringify(shippingAddress);

    const orderResult = await db.run(`
      INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, status)
      VALUES (?, ?, ?, ?, 'bekliyor')
    `, [req.user.id, totalAmount, paymentMethod, shippingAddressJson]);

    for (const item of orderItems) {
      await db.run(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderResult.id, item.productId, item.quantity, item.price]);

      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    let paymentInfo = {};
    if (paymentMethod === 'iban') {
      paymentInfo = {
        iban: 'TR33 0006 1005 1978 6457 8413 26',
        accountHolder: 'Şifalı Bitkiler E-Ticaret A.Ş.',
        bank: 'İş Bankası',
        amount: totalAmount
      };
    } else if (paymentMethod === 'crypto') {
      paymentInfo = {
        addresses: blockchainService.getCryptoAddresses(),
        amounts: {
          bnb: blockchainService.convertCurrency(totalAmount, 'TRY', 'BNB'),
          eth: blockchainService.convertCurrency(totalAmount, 'TRY', 'ETH'),
          btc: blockchainService.convertCurrency(totalAmount, 'TRY', 'BTC')
        }
      };
    }

    res.json(responseSuccess({
      orderId: orderResult.id,
      orderNumber,
      totalAmount,
      paymentMethod,
      paymentInfo
    }, 'Sipariş oluşturuldu'));

  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!req.file) {
      return res.status(400).json(responseError('Dekont/ekran görüntüsü gereklidir'));
    }

    const order = await db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
    if (!order) {
      return res.status(404).json(responseError('Sipariş bulunamadı'));
    }

    if (order.status !== 'bekliyor') {
      return res.status(400).json(responseError('Bu sipariş için ödeme belgesi yüklenemez'));
    }

    await db.run('UPDATE orders SET payment_proof = ? WHERE id = ?', [req.file.filename, orderId]);

    res.json(responseSuccess(null, 'Ödeme belgesi yüklendi, siparişiniz incelenmek üzere gönderildi'));

  } catch (error) {
    console.error('Ödeme belgesi yükleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await db.all(`
      SELECT o.*,
      GROUP_CONCAT(
        json_object(
          'productName', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'images', p.images
        )
      ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    const formattedOrders = orders.map(order => ({
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items: order.items ? order.items.split(',').map(item => JSON.parse(item)) : []
    }));

    res.json(responseSuccess(formattedOrders));

  } catch (error) {
    console.error('Kullanıcı siparişleri getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!order) {
      return res.status(404).json(responseError('Sipariş bulunamadı'));
    }

    const items = await db.all(`
      SELECT oi.*, p.name as product_name, p.images
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    const formattedOrder = {
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items: items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      }))
    };

    res.json(responseSuccess(formattedOrder));

  } catch (error) {
    console.error('Sipariş getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};