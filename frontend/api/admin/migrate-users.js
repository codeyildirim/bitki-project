// Mevcut kullanıcıları API'den localStorage'a migrate etmek için
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // API'deki mevcut kullanıcıları al (bu users array register.js'deki ile aynı olacak)
      // Ancak serverless fonksiyonlarda memory paylaşılamadığı için boş olabilir

      // Demo kullanıcıları döndür - gerçekte kullanıcılar register.js'de saklanıyor
      const apiUsers = [
        // Burası register.js'den alınacak ama şimdilik örnek
      ];

      res.status(200).json({
        success: true,
        data: apiUsers,
        message: 'API kullanıcıları alındı'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Kullanıcı migration hatası'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}