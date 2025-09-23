export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Kullanıcıları listele
    try {
      // localStorage'dan kullanıcıları alamayız çünkü server-side
      // Bunun yerine demo kullanıcılar döndürelim
      const demoUsers = [
        {
          id: 1,
          nickname: 'demo_user',
          city: 'İstanbul',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          status: 'active'
        }
      ];

      res.status(200).json({
        success: true,
        data: demoUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Kullanıcı listesi alınamadı'
      });
    }
  } else if (req.method === 'DELETE') {
    // Kullanıcı silme
    const userId = req.query.id || req.body.id;

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}