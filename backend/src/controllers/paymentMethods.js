import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await db.all('SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY id');

    const formattedMethods = methods.map(method => ({
      ...method,
      details: method.details ? JSON.parse(method.details) : {}
    }));

    res.json(responseSuccess(formattedMethods));

  } catch (error) {
    console.error('Ödeme yöntemleri getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};