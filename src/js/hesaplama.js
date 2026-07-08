/**
 * Presiyometre Hesaplama Modülü
 * Python app.py'deki tüm hesaplama fonksiyonlarının JavaScript karşılığı
 */

// Kalibrasyon tabloları
const HACIM_DUZ_BASINC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 20];
const HACIM_DUZ_DEGER = [0, 1, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 8, 7, 8, 10];
const MEBRAN_HACIM = [15, 80, 140, 200, 250, 300, 350, 400, 480, 650];
const MEBRAN_BASINC = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25];

/**
 * Lineer interpolasyon
 */
function interpolate(x, xTable, yTable) {
    if (x <= xTable[0]) return yTable[0];
    if (x >= xTable[xTable.length - 1]) return yTable[yTable.length - 1];
    for (let i = 0; i < xTable.length - 1; i++) {
        if (xTable[i] <= x && x <= xTable[i + 1]) {
            const ratio = (x - xTable[i]) / (xTable[i + 1] - xTable[i]);
            return yTable[i] + ratio * (yTable[i + 1] - yTable[i]);
        }
    }
    return yTable[yTable.length - 1];
}

/**
 * Basınç dağılımını hesaplar
 * ≤ 20 bar: 1'er bar artış
 * > 20 bar: 20 kademeye sığdırılır
 */
function basincDagilimi(maxBar) {
    maxBar = Math.floor(maxBar);

    if (maxBar <= 20) {
        return Array.from({ length: maxBar + 1 }, (_, i) => i);
    }

    const b = maxBar - 19; // 2-bar adım sayısı
    const a = 19 - b;      // 1-bar adım sayısı

    if (a < 0) {
        // 3'er bar adımlar gerekir
        const basinc = [0];
        let current = 0;
        for (let step = 0; step < 19; step++) {
            const remainingSteps = 19 - step - 1;
            const remainingBar = maxBar - current;
            if (remainingSteps === 0) {
                current = maxBar;
            } else {
                const increment = remainingBar / (remainingSteps + 1);
                current += Math.round(increment);
            }
            basinc.push(current);
        }
        basinc[basinc.length - 1] = maxBar;
        return basinc;
    }

    const basinc = [0];
    let current = 0;
    for (let i = 0; i < a; i++) {
        current += 1;
        basinc.push(current);
    }
    for (let i = 0; i < b; i++) {
        current += 2;
        basinc.push(current);
    }
    return basinc;
}

/**
 * Hidrostatik Basınç = Deney Basıncı + Manometre Yüksekliği / 10
 */
function hesaplaHidrostatikBasinc(deneyBasinci, manometreYuk) {
    return deneyBasinci + manometreYuk / 10.0;
}

/**
 * Hacim Düzeltmesi - kalibrasyon tablosundan interpolasyon
 */
function hesaplaHacimDuzeltmesi(hidrostatikBasinc) {
    return Math.round(interpolate(hidrostatikBasinc, HACIM_DUZ_BASINC, HACIM_DUZ_DEGER));
}

/**
 * Mebran Düzeltmesi - kalibrasyon tablosundan interpolasyon
 */
function hesaplaMebranDuzeltmesi(duzeltilmisHacim) {
    return interpolate(duzeltilmisHacim, MEBRAN_HACIM, MEBRAN_BASINC);
}

/**
 * Hacim ölçer verisi - presiyometre S-eğrisi şeklinde veri üretir
 */
function hacimOlcerVerisi(kademeSayisi, sifirVol) {
    sifirVol = Math.floor(sifirVol);
    if (kademeSayisi <= 1) return [0];

    const n = kademeSayisi - 1;
    const idxPi = Math.min(3, n);
    const idxPf = Math.max(n - 1, idxPi + 1);

    const volFaz1 = sifirVol * 0.60;
    const volFaz2 = sifirVol * 0.85;

    const values = [0];

    // Faz 1: Dik yükseliş
    for (let i = 1; i <= idxPi; i++) {
        const ratio = i / idxPi;
        let val = Math.floor(volFaz1 * (1 - Math.pow(1 - ratio, 2)));
        const noise = Math.floor(Math.random() * 11) - 5;
        val = Math.max(values[values.length - 1] + 10, val + noise);
        values.push(Math.min(val, Math.floor(volFaz1)));
    }

    // Faz 2: Yavaş lineer artış
    const faz2Steps = idxPf - idxPi;
    if (faz2Steps > 0) {
        const faz2Start = values[values.length - 1];
        const faz2Range = volFaz2 - faz2Start;
        for (let i = 1; i <= faz2Steps; i++) {
            const ratio = i / faz2Steps;
            let val = Math.floor(faz2Start + faz2Range * ratio);
            const noise = Math.floor(Math.random() * 7) - 3;
            val = Math.max(values[values.length - 1] + 2, val + noise);
            values.push(Math.min(val, Math.floor(volFaz2)));
        }
    }

    // Faz 3: Hızlı artış
    const faz3Steps = n - idxPf;
    if (faz3Steps > 0) {
        const faz3Start = values[values.length - 1];
        const faz3Range = sifirVol - faz3Start;
        for (let i = 1; i <= faz3Steps; i++) {
            const ratio = i / faz3Steps;
            let val = Math.floor(faz3Start + faz3Range * Math.pow(ratio, 0.5));
            val = Math.max(values[values.length - 1] + 5, val);
            values.push(Math.min(val, sifirVol));
        }
    }

    // Son değer tam sifirVol olsun
    if (values.length > 0) values[values.length - 1] = sifirVol;

    // Kademe sayısı tutarlılığı
    while (values.length < kademeSayisi) values.push(sifirVol);
    return values.slice(0, kademeSayisi);
}

/**
 * Tam rapor hesaplaması — bir deney noktası için tüm tabloyu ve sonuçları üretir
 */
function hesaplaRapor(params) {
    const {
        maxBasinc = 20,
        sifirVol = 535,
        manometreYuk = 0.60
    } = params;

    const basincListesi = basincDagilimi(maxBasinc);
    const kademeSayisi = basincListesi.length;
    const hacimListesi = hacimOlcerVerisi(kademeSayisi, sifirVol);

    // Tablo oluştur
    const tablo = [];
    for (let k = 0; k < kademeSayisi; k++) {
        const deneyBas = basincListesi[k];
        const hacimOkuma = hacimListesi[k];

        const hidrost = hesaplaHidrostatikBasinc(deneyBas, manometreYuk);
        const hacimDuz = hesaplaHacimDuzeltmesi(hidrost);
        const duzHacim = hacimOkuma - hacimDuz;
        const mebranDuz = hesaplaMebranDuzeltmesi(duzHacim);
        const duzBasinc = hidrost - mebranDuz;

        tablo.push({
            kademe: k,
            basinc: deneyBas.toFixed(2),
            hacim: hacimOkuma,
            hidrost: hidrost.toFixed(2),
            hacimDuz: hacimDuz,
            duzHacim: duzHacim,
            mebranDuz: mebranDuz.toFixed(2),
            duzBasinc: duzBasinc.toFixed(2)
        });
    }

    // Belirlenen Değerler
    const n = kademeSayisi - 1;
    const limitBasinc = parseFloat(tablo[n].duzBasinc);

    const idxI = Math.min(3, n);
    const pi = parseFloat(tablo[idxI].duzBasinc);
    const vi = tablo[idxI].duzHacim;

    const idxF = Math.max(n - 1, idxI + 1);
    const pf = parseFloat(tablo[idxF].duzBasinc);
    const vf = tablo[idxF].duzHacim;

    const deltaP = pf - pi;
    const deltaV = vf - vi;
    const vm = (vi + vf) / 2.0;

    // Elastisite Modülü: EM = 2.66 × (V₀ + Vm) × ΔP / ΔV
    const em = deltaV !== 0 ? 2.66 * (sifirVol + vm) * deltaP / deltaV : 0;

    // Net Limit Basınç
    const netLimit = limitBasinc - pi;

    // E / PL
    const ePl = netLimit !== 0 ? em / netLimit : 0;

    return {
        tablo,
        sonuclar: {
            limitBasinc: limitBasinc.toFixed(2),
            elastisite: em.toFixed(2),
            pi: pi.toFixed(2),
            vi: Math.floor(vi),
            pf: pf.toFixed(2),
            vf: Math.floor(vf),
            deltaP: deltaP.toFixed(2),
            deltaV: Math.floor(deltaV),
            netLimit: netLimit.toFixed(2),
            ePl: ePl.toFixed(2)
        }
    };
}

// Export for use in other files
window.Presiyometre = {
    basincDagilimi,
    hacimOlcerVerisi,
    hesaplaHidrostatikBasinc,
    hesaplaHacimDuzeltmesi,
    hesaplaMebranDuzeltmesi,
    hesaplaRapor,
    interpolate,
    HACIM_DUZ_BASINC,
    HACIM_DUZ_DEGER,
    MEBRAN_HACIM,
    MEBRAN_BASINC
};
