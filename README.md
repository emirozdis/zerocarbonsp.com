# Sıfır Karbon Okul Projesi (Zero Carbon SP)

## Proje Hakkında

Sıfır Karbon Okul Projesi, İTÜ GVO İzmir Okulları tarafından başlatılan, öğrencilerin çevre bilincini artırmayı ve sürdürülebilir yaşam alışkanlıklarını teşvik etmeyi amaçlayan yenilikçi bir sürdürülebilirlik girişimidir. Bu proje, haftalık karbon emisyonu liderlik tablosu aracılığıyla öğrencileri ödüllendirerek, gıda atığı takibi ve karbon ayak izi azaltma konularında aktif rol almalarını sağlamaktadır.

## Temel Özellikler

*   **Haftalık Karbon Emisyonu Liderlik Tablosu**: Öğrencilerin karbon ayak izlerini takip ederek, en düşük emisyona sahip olanları ödüllendirir.
*   **Gıda Atığı Takibi ve Hesaplama**: Yemekhanede oluşan gıda atıklarının türüne ve ağırlığına göre CO2 emisyonu ve su ayak izi hesaplaması yapar.
*   **Öğrenci Ödüllendirme Sistemi**: Çevre dostu davranışları teşvik etmek amacıyla sürpriz ödüller sunar.
*   **Detaylı Çevresel Etki İstatistikleri**: Her öğrencinin toplam CO2 emisyonu, su ayak izi ve atık kategorisi dağılımını gösterir.
*   **API Anahtarı Korumalı Yönetim**: Kullanıcı ve atık kayıtları için güvenli API erişimi sağlar.
*   **Duyarlı ve Erişilebilir Arayüz**: Modern ve kullanıcı dostu bir deneyim sunar, karanlık mod desteği içerir.

## Sistem Nasıl Çalışır?

1.  **Atık Girişi ve Tanımlama**: Öğrenciler, yemek sonrası gıda atıklarını (et, süt ürünleri, bitkisel) akıllı atık kutularına atar ve öğrenci kartlarını okutarak kendilerini sisteme tanıtır.
2.  **Hesaplama**: Sistem, atığın ağırlığını ölçer ve türüne göre CO₂ emisyonu ile su ayak izini otomatik olarak hesaplar.
3.  **Liderlik Tablosu ve Ödüllendirme**: Hesaplanan veriler anında liderlik tablosuna yansıtılır. Haftanın sonunda en düşük karbon ayak izine sahip öğrenciler ödüllendirilir.

## Teknoloji Yığını

*   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI (Radix UI), Recharts (veri görselleştirme), Lucide React (ikonlar).
*   **Backend**: Next.js API Routes, Node.js, TypeScript.
*   **Veritabanı**: SQLite.
*   **Yetkilendirme**: API Anahtarı tabanlı yetkilendirme (yazma işlemleri için).

## Proje Ekibi

*   **Proje Danışmanı**: Yasemin Bilgin Kırkgöz
*   **Takım Üyesi**: Aksel Eruysal (Teknik altyapı tasarımı ve geliştirme)
*   **Takım Üyesi**: Mehmet Emir Özdiş (Veri analizi ve liderlik tablosu stratejisi yönetimi)

## Kurulum ve Geliştirme (Yerel)

Bu proje için detaylı kurulum talimatları şu anda mevcut değildir. Genellikle bir Next.js projesini çalıştırmak için aşağıdaki adımlar izlenir:

1.  Depoyu klonlayın:
    ```bash
    git clone https://github.com/emirozdis/zerocarbonsp.com.git
    cd zerocarbonsp.com
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    # veya
    yarn install
    ```
3.  Çevre değişkenlerini ayarlayın. `.env.local` dosyası oluşturarak `API_KEYS` gibi değişkenleri tanımlamanız gerekebilir.
    ```
    API_KEYS=YOUR_SECRET_API_KEY_1,YOUR_SECRET_API_KEY_2
    ```
4.  Uygulamayı geliştirme modunda başlatın:
    ```bash
    npm run dev
    # veya
    yarn dev
    ```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir `issue` açın veya bir `pull request` gönderin.

## Lisans

Bu proje için lisans bilgisi belirtilmemiştir.