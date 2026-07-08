# Android APK Oluşturma Rehberi
## Presiyometre Deney Raporu - Mobil Uygulama

Bu rehber, presiyometre uygulamasının Android APK dosyasını oluşturmak için
adım adım tüm süreci anlatır. Hiçbir adımı atlamayın.

---

## ÖN GEREKSİNİMLER (Bir kez kurulur)

### 1. Node.js Kurulumu

1. Tarayıcıda aç: https://nodejs.org
2. Yeşil **"LTS"** butonuna tıkla → indirmeye başlar
3. İndirilen `.msi` dosyasını çift tıkla
4. Kurulumda tüm ayarları varsayılan bırak → Next → Next → Install → Finish
5. **Doğrulama:** PowerShell aç, yaz:
   ```
   node --version
   ```
   `v18.x.x` veya üzeri görmeli

### 2. Android Studio Kurulumu

1. Tarayıcıda aç: https://developer.android.com/studio
2. **"Download Android Studio"** tıkla → Şartları kabul et → İndir (~1 GB)
3. İndirilen `.exe` dosyasını çift tıkla
4. Kurulum adımları:
   - "Do not import settings" seç → OK
   - Install Type: **Standard** seç → Next
   - SDK bileşenleri inecek (3-5 GB) → **bekle, bu uzun sürer**
   - Finish
5. Android Studio'yu kapat (şimdilik gerek yok)

### 3. Java JDK Kontrolü

Android Studio genelde JDK'yı otomatik kurar. Kontrol:
```
java -version
```
Eğer hata alıyorsan: https://adoptium.net adresinden JDK 17 indir ve kur.

---

## APK OLUŞTURMA (Adım Adım)

### Adım 1: Proje klasörüne git

PowerShell aç ve yaz:
```powershell
cd C:\Zemin_etut\presiyometre-android
```

### Adım 2: Node.js bağımlılıklarını kur

```powershell
npm install
```
Bu komut `package.json`'daki bağımlılıkları (Capacitor) kurar.
Birkaç dakika sürebilir. Bittiğinde `node_modules` klasörü oluşur.

### Adım 3: Capacitor'ı başlat

```powershell
npx cap init "Presiyometre Rapor" "com.haninsan.presiyometre" --web-dir src
```

Sorular gelirse:
- App name: `Presiyometre Rapor` (Enter)
- Package ID: `com.haninsan.presiyometre` (Enter)

Bu komut `capacitor.config.ts` dosyasını günceller.

### Adım 4: Android platformunu ekle

```powershell
npx cap add android
```

Bu komut `android/` klasörünü oluşturur (Android Studio projesi).
İlk çalıştırmada birkaç dakika sürer.

### Adım 5: Web dosyalarını Android'e senkronize et

```powershell
npx cap sync android
```

Bu komut `src/` klasöründeki dosyaları Android projesine kopyalar.

### Adım 6: Android Studio'da projeyi aç

```powershell
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
C:\Zemin_etut\presiyometre-android\android\app\build\outputs\apk\debug\app-debug.apk
```

### Adım 8: APK'yı yeniden adlandır (isteğe bağlı)

```powershell
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "PresiyometreRapor.apk"
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

### USB ile:
1. APK'yı telefona USB ile kopyala
2. Dosya yöneticisinden APK'ya tıkla → Kur

---

## GÜNCELLEME YAPMAK İSTERSEN

1. `src/` klasöründeki dosyaları düzenle (index.html, rapor.html, js/, css/)
2. PowerShell'de:
   ```powershell
   cd C:\Zemin_etut\presiyometre-android
   npx cap sync android
   ```
3. Android Studio'da tekrar: **Build → Build APK(s)**
4. Yeni APK'yı dağıt

---

## SORUN GİDERME

### "npm not recognized" hatası
→ Node.js kurulumunu tekrarla, kurulumdan sonra PowerShell'i kapat-aç

### "cap not recognized" hatası
→ `npm install` komutunu çalıştırdığından emin ol

### Android Studio "Gradle sync failed"
→ Internet bağlantını kontrol et (ilk seferde bağımlılıklar inecek)
→ Android Studio'yu kapat → tekrar `npx cap open android`

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
├── node_modules/          ← (npm install sonrası oluşur)
└── android/               ← (npx cap add android sonrası oluşur)
    └── app/build/outputs/apk/debug/
        └── app-debug.apk  ← SONUÇ: Bu dosyayı dağıt
```

---

## ÖZET KOMUTLAR (Sadece ilk sefer)

```powershell
cd C:\Zemin_etut\presiyometre-android
npm install
npx cap init "Presiyometre Rapor" "com.haninsan.presiyometre" --web-dir src
npx cap add android
npx cap sync android
npx cap open android
# → Android Studio'da: Build → Build APK(s)
```

## ÖZET KOMUTLAR (Güncelleme sonrası)

```powershell
cd C:\Zemin_etut\presiyometre-android
npx cap sync android
npx cap open android
# → Android Studio'da: Build → Build APK(s)
```
