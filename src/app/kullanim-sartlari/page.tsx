import Link from 'next/link'

export const metadata = {
  title: 'Kullanım Şartları | SoruEvim',
  description: 'SoruEvim KPSS platformunu kullanırken uymanız gereken yasal şartlar ve koşullar.',
  alternates: {
    canonical: '/kullanim-sartlari'
  }
}

export default function TermsOfUsePage() {
  return (
    <section className="page-section active" style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
          <span className="text-primary"> Kullanım Şartları</span>
      </div>

      <article className="glass-card" style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '1.05rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Kullanım Şartları ve Koşulları</h1>
          
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Son Güncelleme:</strong> 3 Temmuz 2026
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            Lütfen SoruEvim ("biz", "bizim" veya "Platform") web sitesini (https://soruevimkpss.vercel.app/) kullanmadan önce bu Kullanım Şartları'nı dikkatlice okuyunuz. Siteye erişim sağlayarak veya hizmetlerimizi kullanarak, bu şartların tamamını okuduğunuzu, anladığınızı ve yasal olarak bağlayıcı olduğunu kabul etmiş sayılırsınız. Şartların herhangi bir bölümünü kabul etmiyorsanız, platformu kullanmayı derhal bırakmalısınız.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>1. Hizmetlerin Kapsamı ve Değişiklikler</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim, KPSS (Kamu Personeli Seçme Sınavı) adaylarına yönelik soru bankaları, deneme testleri ve rehberlik yazıları sunan bir eğitim platformudur. Sunulan içeriklerin güncelliği ve doğruluğu için azami gayret gösterilmekle birlikte, müfredat değişiklikleri veya olası hatalar nedeniyle kesin doğruluk garanti edilemez. SoruEvim, platformdaki herhangi bir içeriği, testi veya hizmeti önceden bildirimde bulunmaksızın değiştirme, askıya alma veya tamamen kaldırma hakkını saklı tutar.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>2. Kullanıcı Hesapları ve Sorumluluklar</h3>
          <ul style={{ marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
            <li>Platforma kayıt olurken verdiğiniz bilgilerin doğru, güncel ve eksiksiz olması tamamen sizin sorumluluğunuzdadır.</li>
            <li>Hesabınızın güvenliğini ve şifrenizin gizliliğini korumak sizin sorumluluğunuzdadır. Hesabınız altında gerçekleşen her türlü etkinlikten bizzat sorumlu sayılırsınız.</li>
            <li>Hesabınızın yetkisiz kişilerce kullanıldığını fark ederseniz, derhal bizimle iletişime geçmelisiniz.</li>
            <li>SoruEvim, hileli, yanıltıcı, kötü niyetli veya bu şartlara aykırı kullanım tespit ettiğinde herhangi bir hesabı önceden uyarı yapmaksızın dondurma veya silme hakkına sahiptir.</li>
          </ul>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>3. Fikri Mülkiyet Hakları</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim web sitesinin tasarımı, yazılım kodları, arayüzü, logoları, metinleri, blog içerikleri ve veritabanı mimarisi dâhil olmak üzere platformdaki tüm özgün materyallerin fikri mülkiyet hakları SoruEvim'e aittir. Ziyaretçiler ve üyeler, platformdaki içerikleri yalnızca bireysel, ticari olmayan eğitim amaçları doğrultusunda kullanabilirler. 
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Sitede yer alan verilerin, soruların, testlerin veya yazılımların otomatik botlar, web kazıma (scraping) yöntemleri veya manuel yollarla kopyalanması, çoğaltılması, başka web sitelerinde veya uygulamalarda ticari/ticari olmayan amaçlarla yayınlanması <strong>kesinlikle yasaktır</strong>. Bu ihlalin tespiti halinde derhal yasal yollara başvurulacaktır.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>4. Sorumluluk Reddi (Disclaimer)</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            SoruEvim, hizmetlerini "olduğu gibi" ve "mevcut olduğu şekilde" sunar. Platformun kesintisiz, hatasız, tamamen güvenli olacağına veya sunulan içeriklerin sınavda birebir çıkacağına dair hiçbir açık veya zımni garanti vermez.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Platformumuzdaki testleri çözmeniz, içeriklerden faydalanmanız ve bu içeriklere dayanarak alacağınız kararlar tamamen sizin riskiniz altındadır. SoruEvim; veri kaybı, sınav başarısızlığı, doğrudan, dolaylı, arızi veya cezai zararlar dâhil ancak bunlarla sınırlı olmamak üzere, platformun kullanımından veya kullanılamamasından doğacak hiçbir maddi/manevi zarardan hukuken sorumlu tutulamaz.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>5. Üçüncü Taraf Bağlantıları</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Platformumuz, kontrolümüz dışında olan üçüncü taraf web sitelerine bağlantılar (linkler) içerebilir. Bu sitelerin içeriği, gizlilik politikaları veya uygulamaları üzerinde hiçbir kontrolümüz yoktur ve SoruEvim bu bağlantıların kullanımından doğabilecek hiçbir sorumluluğu kabul etmez.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>6. Uygulanacak Hukuk ve Yetkili Mahkeme</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Bu Kullanım Şartları'nın yorumlanması ve uygulanmasında Türkiye Cumhuriyeti yasaları geçerli olacaktır. İşbu şartlardan doğabilecek her türlü ihtilafın çözümünde Türk Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.
          </p>
      </article>
    </section>
  )
}
