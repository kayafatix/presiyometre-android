/**
 * Presiyometre Mobil App - Ana Uygulama Mantığı
 */

document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    const form = document.getElementById('presiyometreForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        initKuyuDinamik();
    }
}

// Kuyu ekleme/çıkarma
function initKuyuDinamik() {
    document.getElementById('kuyuEkle').addEventListener('click', function () {
        const container = document.getElementById('kuyuContainer');
        const count = container.querySelectorAll('.kuyu-block').length + 1;
        const block = createKuyuBlock(count);
        container.appendChild(block);
    });
}

function createKuyuBlock(index) {
    const div = document.createElement('div');
    div.className = 'kuyu-block';
    div.innerHTML = `
        <div class="kuyu-header">
            <h3>Kuyu ${index}</h3>
            <button type="button" class="btn-remove" onclick="this.closest('.kuyu-block').remove()">✕</button>
        </div>
        <div class="form-row">
            <label>Kuyu Adı</label>
            <input type="text" name="kuyu_${index}_adi" value="SK-${index}" required>
        </div>
        <div class="form-row">
            <label>Deney Derinlikleri (m)</label>
            <input type="text" name="kuyu_${index}_derinlikler" placeholder="3, 6, 9, 12" required>
            <small>Virgülle ayırarak yazın</small>
        </div>
        <div class="form-row">
            <label>Max Basınç (bar)</label>
            <input type="number" name="kuyu_${index}_basinc" value="20" min="5" max="100">
        </div>
    `;
    return div;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const genel = {
        firma_adi: formData.get('firma_adi') || 'HAN İNŞAAT & MÜHENDİSLİK',
        proje_adi: formData.get('proje_adi') || '',
        musteri_adi: formData.get('musteri_adi') || '',
        proje_numarasi: formData.get('proje_numarasi') || '',
        sonda_capi: formData.get('sonda_capi') || '76',
        sifir_vol_hacim: parseInt(formData.get('sifir_vol_hacim') || '535'),
        manometre_yuksekligi: parseFloat(formData.get('manometre_yuksekligi') || '0.60'),
        presiyometre_turu: formData.get('presiyometre_turu') || 'Menard GC',
        deney_tarih: formData.get('deney_tarih') || '',
        sorumlu_adi: formData.get('sorumlu_adi') || '',
        sorumlu_unvan: formData.get('sorumlu_unvan') || '',
        sicil_no: formData.get('sicil_no') || '',
        adres: formData.get('adres') || '',
        iletisim: formData.get('iletisim') || ''
    };

    // Kuyu ve derinlik bilgilerini topla
    const kuyuBlocks = document.querySelectorAll('.kuyu-block');
    const raporlar = [];

    kuyuBlocks.forEach(function (block, i) {
        const idx = i + 1;
        const kuyuAdi = formData.get(`kuyu_${idx}_adi`) || `SK-${idx}`;
        const derinliklerStr = formData.get(`kuyu_${idx}_derinlikler`) || '';
        const maxBasinc = parseInt(formData.get(`kuyu_${idx}_basinc`) || '20');
        const derinlikler = derinliklerStr.split(',').map(d => d.trim()).filter(d => d);

        derinlikler.forEach(function (derinlik) {
            const rapor = window.Presiyometre.hesaplaRapor({
                maxBasinc: maxBasinc,
                sifirVol: genel.sifir_vol_hacim,
                manometreYuk: genel.manometre_yuksekligi
            });

            raporlar.push({
                ...genel,
                kuyu_no: kuyuAdi,
                deney_derinligi: derinlik,
                tablo: rapor.tablo,
                sonuclar: rapor.sonuclar
            });
        });
    });

    // Rapor sayfasına geç
    localStorage.setItem('presiyometre_raporlar', JSON.stringify(raporlar));
    window.location.href = 'rapor.html';
}
