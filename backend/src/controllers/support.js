import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

// FAQ listesini getir (public)
export const getFAQs = async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT * FROM faqs
      WHERE is_active = 1
    `;

    const params = [];
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_index ASC, created_at DESC';

    const faqs = await db.all(query, params);

    // Kategorileri grupla
    const categories = await db.all(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM faqs
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `);

    res.json(responseSuccess({
      faqs,
      categories
    }));

  } catch (error) {
    console.error('FAQ getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// FAQ görüntüleme sayacını artır
export const incrementFAQView = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('UPDATE faqs SET view_count = view_count + 1 WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'Görüntüleme sayısı güncellendi'));

  } catch (error) {
    console.error('FAQ görüntüleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Canlı destek hazır cevapları getir
export const getSupportTemplates = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT * FROM support_templates
      WHERE is_active = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (question LIKE ? OR keywords LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY usage_count DESC, created_at DESC';

    const templates = await db.all(query, params);

    // Kategorileri getir
    const categories = await db.all(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM support_templates
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `);

    res.json(responseSuccess({
      templates,
      categories
    }));

  } catch (error) {
    console.error('Destek şablonları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Hazır cevap kullanım sayacını artır
export const incrementTemplateUsage = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('UPDATE support_templates SET usage_count = usage_count + 1 WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'Kullanım sayısı güncellendi'));

  } catch (error) {
    console.error('Şablon kullanım hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - FAQ Yönetimi
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await db.all('SELECT * FROM faqs ORDER BY category, order_index ASC');
    res.json(responseSuccess(faqs));

  } catch (error) {
    console.error('FAQ listesi getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { category, question, answer, orderIndex } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json(responseError('Kategori, soru ve cevap gereklidir'));
    }

    const result = await db.run(`
      INSERT INTO faqs (category, question, answer, order_index, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [category, question, answer, orderIndex || 0]);

    res.json(responseSuccess({ id: result.id }, 'FAQ oluşturuldu'));

  } catch (error) {
    console.error('FAQ oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, orderIndex, isActive } = req.body;

    await db.run(`
      UPDATE faqs
      SET category = ?, question = ?, answer = ?, order_index = ?, is_active = ?
      WHERE id = ?
    `, [category, question, answer, orderIndex, isActive ? 1 : 0, id]);

    res.json(responseSuccess(null, 'FAQ güncellendi'));

  } catch (error) {
    console.error('FAQ güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM faqs WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'FAQ silindi'));

  } catch (error) {
    console.error('FAQ silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Destek Şablonları Yönetimi
export const getAllSupportTemplates = async (req, res) => {
  try {
    const templates = await db.all('SELECT * FROM support_templates ORDER BY category, usage_count DESC');
    res.json(responseSuccess(templates));

  } catch (error) {
    console.error('Şablon listesi getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const createSupportTemplate = async (req, res) => {
  try {
    const { category, question, answer, keywords } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json(responseError('Kategori, soru ve cevap gereklidir'));
    }

    const result = await db.run(`
      INSERT INTO support_templates (category, question, answer, keywords, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [category, question, answer, keywords || '']);

    res.json(responseSuccess({ id: result.id }, 'Şablon oluşturuldu'));

  } catch (error) {
    console.error('Şablon oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateSupportTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords, isActive } = req.body;

    await db.run(`
      UPDATE support_templates
      SET category = ?, question = ?, answer = ?, keywords = ?, is_active = ?
      WHERE id = ?
    `, [category, question, answer, keywords, isActive ? 1 : 0, id]);

    res.json(responseSuccess(null, 'Şablon güncellendi'));

  } catch (error) {
    console.error('Şablon güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteSupportTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM support_templates WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'Şablon silindi'));

  } catch (error) {
    console.error('Şablon silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Varsayılan FAQ ve şablonları ekle
export const seedDefaultSupport = async () => {
  try {
    // Varsayılan FAQ'lar
    const defaultFAQs = [
      {
        category: 'Sipariş',
        question: 'Siparişim ne zaman teslim edilir?',
        answer: 'Siparişleriniz onaylandıktan sonra 1-3 iş günü içinde kargoya verilir. Kargo süresi şehre göre 1-3 gün arasında değişmektedir.'
      },
      {
        category: 'Sipariş',
        question: 'Kargo ücreti var mıdır?',
        answer: '150 TL ve üzeri alışverişlerinizde kargo ücretsizdir. 150 TL altı siparişlerde 15 TL kargo ücreti uygulanır.'
      },
      {
        category: 'Ödeme',
        question: 'Hangi ödeme yöntemleri kabul edilir?',
        answer: 'Banka havalesi/EFT ve kripto para (Bitcoin, Ethereum, BNB) ile ödeme yapabilirsiniz.'
      },
      {
        category: 'Ödeme',
        question: 'Taksit seçeneği var mıdır?',
        answer: 'Şu anda sadece tek çekim ödeme kabul edilmektedir. Yakında taksit seçenekleri eklenecektir.'
      },
      {
        category: 'İade',
        question: 'İade süresi nedir?',
        answer: 'Ürünlerinizi teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz.'
      },
      {
        category: 'Ürünler',
        question: 'Ürünleriniz organik midir?',
        answer: 'Tüm ürünlerimiz %100 doğal ve organiktir. Kimyasal madde içermez.'
      }
    ];

    for (const faq of defaultFAQs) {
      const existing = await db.get('SELECT * FROM faqs WHERE question = ?', [faq.question]);
      if (!existing) {
        await db.run(`
          INSERT INTO faqs (category, question, answer, order_index, is_active)
          VALUES (?, ?, ?, 0, 1)
        `, [faq.category, faq.question, faq.answer]);
      }
    }

    // Varsayılan destek şablonları
    const defaultTemplates = [
      {
        category: 'Selamlama',
        question: 'Merhaba',
        answer: 'Merhaba! Şifalı Bitkiler E-Ticaret\'e hoş geldiniz. Size nasıl yardımcı olabilirim?',
        keywords: 'selam,merhaba,günaydın,iyi günler'
      },
      {
        category: 'Sipariş Takip',
        question: 'Siparişimi nasıl takip edebilirim?',
        answer: 'Hesabınıza giriş yaptıktan sonra "Siparişlerim" sayfasından tüm siparişlerinizi ve kargo takip numaralarını görebilirsiniz.',
        keywords: 'sipariş,takip,kargo,nerede'
      },
      {
        category: 'Üyelik',
        question: 'Nasıl üye olabilirim?',
        answer: 'Ana sayfamızdaki "Kayıt Ol" butonuna tıklayarak, kullanıcı adı ve şifre belirleyerek kolayca üye olabilirsiniz.',
        keywords: 'üye,kayıt,hesap'
      },
      {
        category: 'İletişim',
        question: 'Size nasıl ulaşabilirim?',
        answer: 'info@sifalibitkiler.com adresinden bize e-posta gönderebilir veya 0850 123 45 67 numaralı telefondan ulaşabilirsiniz.',
        keywords: 'iletişim,telefon,mail,ulaş'
      }
    ];

    for (const template of defaultTemplates) {
      const existing = await db.get('SELECT * FROM support_templates WHERE question = ?', [template.question]);
      if (!existing) {
        await db.run(`
          INSERT INTO support_templates (category, question, answer, keywords, is_active)
          VALUES (?, ?, ?, ?, 1)
        `, [template.category, template.question, template.answer, template.keywords]);
      }
    }

    console.log('Varsayılan destek içeriği oluşturuldu');
  } catch (error) {
    console.error('Varsayılan destek içeriği oluşturma hatası:', error);
  }
};