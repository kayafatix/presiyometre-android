# Android APK Oluşturma Rehberi
## Presiyometre Deney Raporu - Mobil Uygulama

Bu rehber, presiyometre uygulamasının Android APK dosyasını oluşturmak için
adım adım tüm süreci anlatır. **macOS (MacBook)** üzerinde çalışmak üzere hazırlanmıştır.

---

## ÖN GEREKSİNİMLER (Bir kez kurulur)

### 1. Node.js Kurulumu

**Homebrew ile (önerilen):**
```bash
# Homebrew yoksa önce kur:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js kur:
brew install node
```

**Veya:** https://nodejs.org adresinden macOS installer (.pkg) indir ve kur.

**Doğrulama:**
```bash
node --version    # v18.x.x veya üzeri
npm --version
```

### 2. Android Studio Kurulumu

1. Tarayıcıda aç: https://developer.android.com/studio
2. **"Download Android Studio"** → macOS (Apple Silicon veya Intel) seç → İndir
3. İndirilen `.dmg` dosyasını aç → Android Studio'yu `Applications` klasörüne sürükle
4. İlk açılışta:
   - "Do not import settings" seç → OK
   - Install Type: **Standard** seç → Next
   - SDK bileşenleri inecek (3-5 GB) → **bekle, bu uzun sürer**
   - Finish
5. Android Studio'yu kapat (şimdilik gerek yok)

### 3. Java JDK Kontrolü

Android Studio genelde JDK'yı otomatik kurar. Kontrol:
```bash
java -version
```
Eğer hata alıyorsan:
```bash
brew install openjdk@17
```

### 4. ANDROID_HOME Ortam Değişkeni

`~/.zshrc` dosyasına ekle (Terminal'de):
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

---

## APK OLUŞTURMA (Adım Adım)

### Adım 1: Proje klasörüne git

Terminal aç ve yaz:
```bash
cd ~/path/to/presiyometre-android
```

### Adım 2: Node.js bağımlılıklarını kur

```bash
npm install
```
Bu komut `package.json`'daki bağımlılıkları (Capacitor) kurar.
Birkaç dakika sürebilir. Bittiğinde `node_modules` klasörü oluşur.

### Adım 3: Capacitor'ı başlat

```bash
npx cap init "Presiyometre Rapor" "com.haninsan.presiyometre" --web-dir src
```

Sorular gelirse:
- App name: `Presiyometre Rapor` (Enter)
- Package ID: `com.haninsan.presiyometre` (Enter)

Bu komut `capacitor.config.ts` dosyasını günceller.

### Adım 4: Android platformunu ekle

```bash
npx cap add android
```

Bu komut `android/` klasörünü oluşturur (Android Studio projesi).
İlk çalıştırmada birkaç dakika sürer.

### Adım 5: Web dosyalarını Android'e senkronize et

```bash
npx cap sync android
```

Bu komut `src/` klasöründeki dosyaları Android projesine kopyalar.

### Adım 6: Android Studio'da projeyi aç

```bash
npx cap open android
```

Android Studio açılır ve projeyi yükler.
**İlk açılışta Gradle sync yapacaktır — 3-5 dakika bekle.**
Sağ alt köşedeki progress bar'ın bitmesini bekle.

### Adım 7: APK oluştur (Android Studio içinde)

1. Üst menüden: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Alt tarafta "Build" sekmesinde ilerlemeyi görebilirsin
3. Birkaç dakika sürer
4. Tamamlandığında sağ altta bir bildirim çıkar: **"Build APK(s)"** 
5. **"locate"** linkine tıkla → APK dosyasının bulunduğu klasör açılır

APK konumu:
```
presiyometre-android/android/app/build/outputs/apk/debug/app-debug.apk
```

### Adım 8: APK'yı yeniden adlandır (isteğe bağlı)

```bash
cp android/app/build/outputs/apk/debug/app-debug.apk PresiyometreRapor.apk
```

---

## APK'YI DAĞITMA

### WhatsApp ile gönderme:
1. `PresiyometreRapor.apk` dosyasını WhatsApp'ta kişiye gönder
2. Karşı taraf dosyaya tıklar
3. "Bilinmeyen kaynaklardan yüklemeye izin ver" uyarısı çıkar → İzin Ver
4. "Yükle" tıkla → uygulama kurulur

### E-posta ile gönderme:
1. APK dosyasını e-postaya ekle ve gönder
2. Alıcı indirip kurar (aynı izin adımları)

### AirDrop + USB:
1. APK'yı AirDrop ile Android telefona gönderemezsin (sadece iOS arası)
2. USB veya Google Drive/e-posta kullan

---

## GÜNCELLEME YAPMAK İSTERSEN

1. `src/` klasöründeki dosyaları düzenle (index.html, rapor.html, js/, css/)
2. Terminal'de:
   ```bash
   cd ~/path/to/presiyometre-android
   npx cap sync android
   ```
3. Android Studio'da tekrar: **Build → Build APK(s)**
4. Yeni APK'yı dağıt

---

## SORUN GİDERME

### "npm: command not found" hatası
→ Node.js kurulumunu tekrarla: `brew install node`

### "cap: command not found" hatası
→ `npm install` komutunu çalıştırdığından emin ol

### Android Studio "Gradle sync failed"
→ İnternet bağlantını kontrol et (ilk seferde bağımlılıklar inecek)
→ Android Studio'yu kapat → tekrar `npx cap open android`
→ macOS'ta proxy/VPN varsa kapat

### "ANDROID_HOME is not set" hatası
→ Yukarıdaki "ANDROID_HOME Ortam Değişkeni" adımını uygula

### APK telefona kurulmuyor
→ Telefon ayarlarından: Güvenlik → "Bilinmeyen uygulamalara izin ver" aç
→ Android 8+ için: dosya yöneticisi uygulamasına kurulum izni ver

### Grafikler APK'da görünmüyor
→ İnternet bağlantısı gerekli (Chart.js CDN'den yükleniyor)
→ Offline çalışması için chart.js dosyasını `src/js/` altına indir ve local referans ver

---

## KLASÖR YAPISI

```
presiyometre-android/
├── .gitignore             ← Git'e dahil edilmeyecek dosyalar
├── REHBER.md              ← Bu dosya
├── package.json           ← Node.js bağımlılıkları
├── capacitor.config.ts    ← Capacitor ayarları
├── src/                   ← Uygulama kaynak dosyaları
│   ├── index.html         ← Ana form sayfası
│   ├── rapor.html         ← Rapor gösterim + PDF indirme
│   ├── css/
│   │   └── style.css      ← Stiller
│   ├── js/
│   │   ├── app.js         ← Form mantığı
│   │   ├── hesaplama.js   ← Presiyometre hesaplamaları
│   │   └── pdf.js         ← PDF oluşturma
│   └── img/
│       └── logo.png       ← Firma logosu
├── node_modules/          ← (npm install sonrası oluşur - GIT'E DAHİL DEĞİL)
└── android/               ← (npx cap add android sonrası oluşur - GIT'E DAHİL DEĞİL)
    └── app/build/outputs/apk/debug/
        └── app-debug.apk  ← SONUÇ: Bu dosyayı dağıt
```

---

## ÖZET KOMUTLAR (Sadece ilk sefer)

```bash
cd ~/path/to/presiyometre-android
npm install
npx cap init "Presiyometre Rapor" "com.haninsan.presiyometre" --web-dir src
npx cap add android
npx cap sync android
npx cap open android
# → Android Studio'da: Build → Build APK(s)
```

## ÖZET KOMUTLAR (Güncelleme sonrası)

```bash
cd ~/path/to/presiyometre-android
npx cap sync android
npx cap open android
# → Android Studio'da: Build → Build APK(s)
```
