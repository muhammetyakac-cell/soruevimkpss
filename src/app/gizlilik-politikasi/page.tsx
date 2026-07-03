import Link from 'next/link'

export const metadata = {
  title: 'Gizlilik Politikası | SoruEvim',
  description: 'SoruEvim KPSS hazırlık platformu gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme.',
  alternates: {
    canonical: '/gizlilik-politikasi'
  }
}

export default function PrivacyPolicyPage() {
  return (
    <section className="page-section active" style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
          <span className="text-primary"> Gizlilik Politikası</span>
      </div>

      <article className="glass-card" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '1.05rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
          
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Son Güncelleme:</strong> 3 Temmuz 2026
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim ("biz", "bizim" veya "Platform") olarak, gizliliğinize ve kişisel verilerinizin güvenliğine en yüksek önemi vermekteyiz. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuat uyarınca, web sitemizi (https://soruevimkpss.vercel.app/) ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda bilgilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>1. Toplanan Kişisel Veriler</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Hizmetlerimizi kullandığınızda aşağıdaki veri türlerini toplayabiliriz:
          </p>
          <ul style={{ marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
            <li><strong>Kayıt ve Profil Bilgileri:</strong> Platforma üye olmanız durumunda adınız, e-posta adresiniz ve belirlediğiniz şifre (şifrelenmiş olarak).</li>
            <li><strong>Kullanım ve Performans Verileri:</strong> Çözdüğünüz testler, doğru/yanlış istatistikleriniz, hangi konularda zayıf veya güçlü olduğunuzu gösteren analitik veriler.</li>
            <li><strong>Teknik Cihaz Verileri:</strong> IP adresiniz, tarayıcı türünüz, işletim sisteminiz, siteye giriş çıkış saatleriniz ve çerez (cookie) aracılığıyla elde edilen oturum verileriniz.</li>
          </ul>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>2. Verilerin Kullanım Amaçları</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Toplanan kişisel verileriniz, aşağıdaki amaçlarla sınırlı olmak üzere işlenmektedir:
          </p>
          <ul style={{ marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
            <li>Platforma güvenli giriş yapmanızı ve hesap ayarlarınızı yönetmenizi sağlamak.</li>
            <li>Test çözme geçmişinizi kaydederek KPSS hazırlık sürecinizde size kişiselleştirilmiş performans analizleri sunmak.</li>
            <li>Sistemdeki olası teknik hataları tespit etmek ve platform performansını iyileştirmek.</li>
            <li>KVKK ve diğer yürürlükteki mevzuatlardan doğan yasal yükümlülüklerimizi yerine getirmek.</li>
          </ul>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>3. Verilerin Üçüncü Kişilerle Paylaşımı</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim olarak, kişisel verilerinizi kesinlikle satmıyoruz. Verileriniz yalnızca yasal zorunluluklar dâhilinde resmi makamlarla veya altyapı hizmeti aldığımız güvenilir teknoloji iş ortaklarımızla (örneğin güvenli veritabanı sağlayıcıları, sunucu barındırma hizmetleri) KVKK kurallarına uygun olarak ve sadece hizmetin gerektirdiği ölçüde paylaşılabilir.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>4. Çerezler (Cookies) ve Takip Teknolojileri</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Web sitemiz, oturumunuzu açık tutmak, kullanıcı tercihlerinizi hatırlamak ve site trafiğini anonim olarak analiz etmek amacıyla çerezler (cookies) kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman reddedebilir veya silebilirsiniz. Ancak çerezleri kapatmanız durumunda hesap girişi gerektiren bazı özelliklerin (test geçmişini kaydetme vb.) düzgün çalışmayabileceğini unutmayınız.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>5. Veri Güvenliği</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Kişisel verilerinizin yetkisiz erişim, kayıp, değiştirilme veya imha risklerine karşı korunması için sektör standartlarında güvenlik önlemleri (SSL şifreleme, güvenli veritabanı mimarisi) uygulamaktayız. Şifreleriniz veritabanımızda geri döndürülemez kriptografik özetleme (hashing) yöntemleriyle saklanmaktadır. Ancak, internet üzerinden yapılan hiçbir veri aktarımının %100 güvenli olamayacağını ve sistemlerimizin siber saldırılara karşı mutlak bir garantisi bulunmadığını kabul edersiniz.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>6. Kullanıcı Hakları (KVKK Madde 11)</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            KVKK kapsamında kullanıcılar; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, eksik veya yanlış işlenmişse düzeltilmesini isteme, kanuni şartlar çerçevesinde verilerin silinmesini veya yok edilmesini talep etme hakkına sahiptir. 
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Bu haklarınızı kullanmak veya hesabınızı ve ilişkili tüm verilerinizi kalıcı olarak silmek isterseniz, bizimle iletişime geçebilirsiniz.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>7. Politika Değişiklikleri</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim, bu Gizlilik Politikası'nda önceden haber vermeksizin değişiklik yapma hakkını saklı tutar. Yapılan değişiklikler, bu sayfada güncel tarih ile yayınlandığı andan itibaren geçerli kabul edilir.
          </p>
      </article>
    </section>
  )
}
