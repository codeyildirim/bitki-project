// Production Admin Account Creator
// Bu script ile Render.com'da admin hesabı oluşturabilirsiniz

const API_URL = 'https://bitki-project.onrender.com'; // Render.com backend URL'niz

async function createAdminAccount() {
  try {
    console.log('🔄 Admin hesabı oluşturuluyor...');
    console.log('📡 API URL:', API_URL);

    // Önce mevcut admin kontrolü yap
    const checkResponse = await fetch(`${API_URL}/api/setup/check`);
    const checkData = await checkResponse.json();

    console.log('📊 Veritabanı durumu:', checkData.data);

    if (checkData.data.hasAdmin) {
      console.log('⚠️  Admin hesabı zaten mevcut!');
      console.log(`📈 Toplam kullanıcı sayısı: ${checkData.data.totalUsers}`);
      console.log(`👑 Admin sayısı: ${checkData.data.adminCount}`);
      return;
    }

    // Admin hesabı oluştur
    const createResponse = await fetch(`${API_URL}/api/setup/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await createResponse.json();

    if (result.success) {
      console.log('✅ Admin hesabı başarıyla oluşturuldu!');
      console.log('');
      console.log('🔑 Giriş Bilgileri:');
      console.log('👤 Kullanıcı Adı:', result.credentials.username);
      console.log('🔒 Şifre:', result.credentials.password);
      console.log('🔐 Kurtarma Kodu:', result.credentials.recoveryCode);
      console.log('');
      console.log('🌐 Admin Panel URL: https://bitki-admin.vercel.app');
      console.log('');
      console.log('⚠️  DİKKAT: Bu bilgileri güvenli bir yerde saklayın!');
    } else {
      console.error('❌ Hata:', result.message);
    }

  } catch (error) {
    console.error('💥 Bağlantı hatası:', error.message);
    console.log('');
    console.log('🔧 Çözüm önerileri:');
    console.log('1. Internet bağlantınızı kontrol edin');
    console.log('2. Render.com backend servisinizin çalıştığından emin olun');
    console.log('3. API URL\'sinin doğru olduğunu kontrol edin');
  }
}

// Script'i çalıştır
createAdminAccount();