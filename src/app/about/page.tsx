import { Card } from "@/components/ui/card";
import { Users, Target, Trash2, Calculator, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AboutPage() {
    return (
        <main className="min-h-screen py-8 px-4 md:py-12">
            <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 md:space-y-20 px-4 sm:px-6">
                {/* Hero Section */}
                <div className="text-center space-y-3 sm:space-y-4 md:space-y-5 pt-24 md:pt-32">
                    <div className="inline-block p-3 sm:p-4 rounded-full bg-primary/10 mb-2">
                        <img src="/logo.svg" alt="Zero Carbon Project Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                        Geleceği Şekillendiren Adımlar: <br /> Sıfır Karbon Okul Projesi
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                        İTÜ GVO İzmir Okulları olarak, daha yeşil ve sürdürülebilir bir dünya için öğrencilerimizle birlikte karbon ayak izimizi azaltıyoruz.
                    </p>
                </div>

                {/* About Us Section */}
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                        Projemiz Hakkında
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Card className="p-6 sm:p-8 text-left bg-gradient-to-br from-background to-secondary/30">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold">Amacımız</h3>
                            </div>
                            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                                Bu proje, öğrencilerimizde çevre bilincini artırmak, karbon emisyonlarının gezegenimiz üzerindeki etkilerini somut verilerle göstermek ve sürdürülebilir yaşam alışkanlıklarını teşvik etmek amacıyla başlatılmıştır.
                            </p>
                        </Card>
                        <Card className="p-6 sm:p-8 text-left bg-gradient-to-br from-background to-secondary/30">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold">Yaklaşımımız</h3>
                            </div>
                            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                                Haftalık olarak karbon emisyonlarını takip ederek, en az karbon salımı yapan öğrencilerimizi ödüllendiriyoruz. Bu liderlik tablosu ile hem tatlı bir rekabet ortamı yaratıyor hem de hep birlikte daha yeşil bir gelecek inşa ediyoruz.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Bento Grid - How It Works Section */}
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                        Sistem Nasıl Çalışır?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Step 1 - Large Card */}
                        <Card className="relative p-6 sm:p-8 md:col-span-2 flex flex-col justify-between bg-gradient-to-br from-background to-secondary/30">
                            <div className="z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold">1. Adım: Atık Girişi ve Tanımlama</h3>
                                </div>
                                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                                    Her şey yemekhanede başlıyor. Öğrenciler, yemek sonrası gıda atıklarını et, süt ürünleri ve bitkisel atıklar için ayrı olarak tasarlanmış akıllı atık kutularına atar. Kutudaki entegre okuyucuya öğrenci kartlarını okutarak kendilerini sisteme tanıtırlar.
                                </p>
                            </div>
                            {/* Desktop/Large Screen Step Count (Top Right - Large) */}
                            <div className="absolute top-0 right-0 text-[10rem] font-bold text-primary/10 select-none opacity-50 pr-4 pt-2 pointer-events-none hidden md:block">
                                01
                            </div>
                            {/* Mobile Step Count (Bottom Right - Smaller) */}
                            <div className="text-right text-6xl md:text-7xl font-bold text-primary/10 select-none -mb-4 -mr-2 md:hidden">
                                01
                            </div>
                        </Card>
                        {/* Step 2 - Small Card */}
                        <Card className="relative overflow-hidden p-6 sm:p-8 flex flex-col justify-between text-left bg-gradient-to-br from-background to-secondary/30">
                            <div className="z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Calculator className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold">2. Adım: Hesaplama</h3>
                                </div>
                                <p className="text-sm sm:text-base text-foreground/80">
                                    Sistem, atığın ağırlığını ölçer ve türüne göre CO₂ emisyonunu hesaplar.
                                </p>
                            </div>
                            {/* Step Count (Top Right - Large) */}
                            <div className="absolute top-0 right-0 text-9xl font-bold text-primary/10 select-none pr-4 pt-2 pointer-events-none">
                                02
                            </div>
                        </Card>
                        {/* Step 3 - Full Width Card */}
                        <Card className="relative overflow-hidden p-6 sm:p-8 md:col-span-3 flex flex-col md:flex-row items-center text-center md:text-left gap-6 bg-secondary/30 border-primary/30">
                            <div className="relative z-10 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                                <div className="p-4 rounded-full bg-primary/10 flex-shrink-0">
                                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2">3. Adım: Liderlik Tablosu ve Ödüllendirme</h3>
                                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                                        Hesaplanan veriler anında liderlik tablosuna yansıtılır. Haftanın sonunda en düşük karbon ayak izine sahip olan çevre dostu öğrencilerimiz sürpriz ödüller kazanır ve başarıları kutlanır!
                                    </p>
                                </div>
                            </div>
                            {/* Step Count (Top Right - Large) */}
                            <div className="absolute top-0 right-0 text-[10rem] font-bold text-primary/10 select-none opacity-50 pr-4 pt-2 pointer-events-none">
                                03
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Team Section */}
                 
    <div className="max-w-5xl mx-auto">
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
        Proje Ekibimiz
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Teacher Card - Featured */}
        <Card className="relative overflow-hidden p-6 sm:p-8 md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-secondary/30 border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <Avatar className="w-full h-full border-4 border-primary/30 shadow-xl">
                  <AvatarImage alt="Yasemin Bilgin Kırkgöz" />
                  <AvatarFallback>YB</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-3 py-1 mb-3 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold">
                Proje Danışmanı
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Yasemin Bilgin Kırkgöz</h3>
              <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
                Çevre bilinci ve sürdürülebilir yaşam konularında öğrencilerimize rehberlik eden değerli öğretmenimiz. Projenin her aşamasında öğrencilere mentorluk yaparak, geleceğin çevre liderleri yetiştiriyor.
              </p>
            </div>
          </div>
        </Card>

        {/* Owner 1 Card */}
        <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-background to-secondary/30 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4">
              <Avatar className="w-full h-full border-3 border-primary/20 shadow-lg">
                <AvatarImage alt="Aksel Eruysal" />
                <AvatarFallback>AE</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <div className="inline-block px-2 py-1 mb-2 rounded-full bg-secondary text-xs font-semibold">
                Takım Üyesi
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Aksel Eruysal</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Karbon ayak izi takip sisteminin teknik altyapısını tasarlayan ve geliştiren öğrenci.
              </p>
            </div>
          </div>
        </Card>

        {/* Owner 2 Card */}
        <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-background to-secondary/30 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4">
              <Avatar className="w-full h-full border-3 border-primary/20 shadow-lg">
                <AvatarImage alt="Mehmet Emir Özdiş" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <div className="inline-block px-2 py-1 mb-2 rounded-full bg-secondary text-xs font-semibold">
                Takım Üyesi
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Mehmet Emir Özdiş</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Veri analizi ve liderlik tablosu sisteminin stratejisini yöneten öğrenci.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>

                {/* How to Join Section */}
                <div className="text-center max-w-3xl mx-auto pb-6 sm:pb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                        Nasıl Katılabilirim?
                    </h2>
                    <Card className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 shadow-lg">
                        <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                            <img src="/logo.svg" alt="Zero Carbon Project Logo" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary">
                                Harekete Geç!
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-foreground/80 mb-5 sm:mb-6 text-pretty leading-relaxed">
                            Projeye katılmak ve liderlik tablosunda yerini almak çok kolay! Tek yapman gereken, projemizden sorumlu öğretmenimiz <b>Yasemin Bilgin Kırkgöz</b> ile iletişime geçmek. Kendisi sana süreçle ilgili tüm detayları anlatacak ve kaydını oluşturacaktır.
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Unutma, gezegenimiz için attığın her küçük adım büyük bir fark yaratır!
                        </p>
                    </Card>
                </div>
            </div>
        </main>
    );
}