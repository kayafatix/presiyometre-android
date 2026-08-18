/**
 * Presiyometre Hesaplama Modülü
 * Python app.py'deki tüm hesaplama fonksiyonlarının JavaScript karşılığı
 */

const HACIM_DUZ_BASINC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 20];
const HACIM_DUZ_DEGER = [0, 1, 1, 2, 3, 4, 5, 6, 6, 7, 8, 9, 8, 7, 8, 10];
const MEBRAN_HACIM = [15, 80, 140, 200, 250, 300, 350, 400, 480, 650];
const MEBRAN_BASINC = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25];

const ELASTISITE_TABLE = {
    5: [50, 10], 6: [60, 10], 7: [70, 10], 8: [80, 10],
    9: [90, 10], 10: [100, 10], 11: [110, 10], 12: [120, 10],
    13: [130, 10], 14: [150, 20], 15: [170, 20],
    16: [200, 30], 17: [230, 30], 18: [260, 30],
    19: [300, 40], 20: [340, 40], 21: [380, 40], 22: [420, 40], 23: [460, 40],
    24: [500, 50], 25: [550, 50], 26: [600, 50], 27: [650, 50],
    28: [700, 50], 29: [750, 50], 30: [800, 50],
};

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

function basincDagilimi(maxBar) {
    maxBar = Math.floor(maxBar);
    if (maxBar <= 20) return Array.from({ length: maxBar + 1 }, (_, i) => i);
    const b = maxBar - 20, a = 20 - b;
    if (a < 0) {
        const basinc = [0]; let current = 0;
        for (let step = 0; step < 20; step++) {
            const rem = 20 - step - 1, remBar = maxBar - current;
            current = rem === 0 ? maxBar : current + Math.round(remBar / (rem + 1));
            basinc.push(current);
        }
        basinc[basinc.length - 1] = maxBar; return basinc;
    }
    const basinc = [0]; let current = 0;
    for (let i = 0; i < a; i++) { current += 1; basinc.push(current); }
    for (let i = 0; i < b; i++) { current += 2; basinc.push(current); }
    return basinc;
}

function hesaplaHidrostatikBasinc(deneyBasinci, manometreYuk) { return deneyBasinci + manometreYuk / 10.0; }
function hesaplaHacimDuzeltmesi(hidrostatikBasinc) { return Math.round(interpolate(hidrostatikBasinc, HACIM_DUZ_BASINC, HACIM_DUZ_DEGER)); }
function hesaplaMebranDuzeltmesi(duzeltilmisHacim) { return interpolate(duzeltilmisHacim, MEBRAN_HACIM, MEBRAN_BASINC); }

function getElastisiteModulu(maxBar) {
    maxBar = Math.floor(maxBar);
    let base, tolerance;
    if (ELASTISITE_TABLE[maxBar]) [base, tolerance] = ELASTISITE_TABLE[maxBar];
    else if (maxBar < 5) [base, tolerance] = ELASTISITE_TABLE[5];
    else [base, tolerance] = ELASTISITE_TABLE[30];
    return base + Math.floor(Math.random() * (2 * tolerance + 1)) - tolerance;
}

function getPiPfIndices(maxBar, n) {
    maxBar = Math.floor(maxBar);
    let idxI, idxF;
    if (maxBar <= 6) { idxI = Math.min(2, n); idxF = n - 1; }
    else if (maxBar <= 8) { idxI = Math.min(3, n); idxF = n - 1; }
    else if (maxBar <= 12) { idxI = Math.min(3, n); idxF = n - 2; }
    else if (maxBar <= 17) { idxI = Math.min(3, n); idxF = n - 3; }
    else {
        idxI = Math.min(3, n);
        const offsets = [0, 0, 1, 1, 2];
        idxF = n - 3 - offsets[Math.floor(Math.random() * offsets.length)];
    }
    idxF = Math.max(idxF, idxI + 1);
    idxF = Math.min(idxF, n);
    return [idxI, idxF];
}

function hacimOlcerVerisi(kademeSayisi, sifirVol, maxBar = 20) {
    sifirVol = Math.floor(sifirVol);
    if (kademeSayisi <= 1) return [0];
    const n = kademeSayisi - 1;
    const [idxPi, idxPf] = getPiPfIndices(maxBar, n);
    const volFaz1 = sifirVol * 0.55;
    const faz2Toplam = 40 + Math.floor(Math.random() * 36);
    const volFaz2 = volFaz1 + faz2Toplam;
    const values = [0];

    // Faz 1: Dik yükseliş
    for (let i = 1; i <= idxPi; i++) {
        const ratio = i / idxPi;
        let val = Math.floor(volFaz1 * (1 - Math.pow(1 - ratio, 2)));
        val = Math.max(values[values.length - 1] + 10, val + Math.floor(Math.random() * 11) - 5);
        values.push(Math.min(val, Math.floor(volFaz1)));
    }

    // Faz 2: Neredeyse yatay (max 75 cm³)
    const faz2Steps = idxPf - idxPi;
    if (faz2Steps > 0) {
        const faz2Start = values[values.length - 1];
        for (let i = 1; i <= faz2Steps; i++) {
            const ratio = i / faz2Steps;
            let val = Math.floor(faz2Start + faz2Toplam * ratio);
            val = Math.max(values[values.length - 1] + 1, val + Math.floor(Math.random() * 5) - 2);
            values.push(Math.min(val, Math.floor(volFaz2)));
        }
    }

    // Faz 3: İvmelenen artış (ratio^1.5)
    const faz3Steps = n - idxPf;
    if (faz3Steps > 0) {
        const faz3Start = values[values.length - 1];
        const faz3Range = sifirVol - faz3Start;
        for (let i = 1; i <= faz3Steps; i++) {
            const ratio = i / faz3Steps;
            let val = Math.floor(faz3Start + faz3Range * Math.pow(ratio, 1.5));
            val = Math.max(values[values.length - 1] + 10, val);
            values.push(Math.min(val, sifirVol));
        }
    }

    if (values.length > 0) values[values.length - 1] = sifirVol;
    while (values.length < kademeSayisi) values.push(sifirVol);
    return values.slice(0, kademeSayisi);
}

function hesaplaRapor(params) {
    const { maxBasinc = 20, sifirVol = 535, manometreYuk = 0.60 } = params;
    const basincListesi = basincDagilimi(maxBasinc);
    const kademeSayisi = basincListesi.length;
    const hacimListesi = hacimOlcerVerisi(kademeSayisi, sifirVol, maxBasinc);

    const tablo = [];
    for (let k = 0; k < kademeSayisi; k++) {
        const deneyBas = basincListesi[k], hacimOkuma = hacimListesi[k];
        const hidrost = hesaplaHidrostatikBasinc(deneyBas, manometreYuk);
        const hacimDuz = hesaplaHacimDuzeltmesi(hidrost);
        const duzHacim = hacimOkuma - hacimDuz;
        const mebranDuz = hesaplaMebranDuzeltmesi(duzHacim);
        const duzBasinc = hidrost - mebranDuz;
        tablo.push({ kademe: k, basinc: deneyBas.toFixed(2), hacim: hacimOkuma, hidrost: hidrost.toFixed(2), hacimDuz, duzHacim, mebranDuz: mebranDuz.toFixed(2), duzBasinc: duzBasinc.toFixed(2) });
    }
    while (tablo.length < 21) tablo.push({ kademe: '', basinc: '', hacim: '', hidrost: '', hacimDuz: '', duzHacim: '', mebranDuz: '', duzBasinc: '' });

    const n = kademeSayisi - 1;
    const limitBasinc = parseFloat(tablo[n].duzBasinc);
    const [idxI, idxF] = getPiPfIndices(maxBasinc, n);
    const pi = parseFloat(tablo[idxI].duzBasinc), vi = tablo[idxI].duzHacim;
    const pf = parseFloat(tablo[idxF].duzBasinc), vf = tablo[idxF].duzHacim;
    const deltaP = pf - pi, deltaV = vf - vi;
    const em = getElastisiteModulu(maxBasinc);
    const netLimit = limitBasinc - pi;
    const ePl = netLimit !== 0 ? em / netLimit : 0;

    return {
        tablo, sonuclar: {
            limitBasinc: limitBasinc.toFixed(2), elastisite: em.toFixed(2),
            pi: pi.toFixed(2), vi: Math.floor(vi), pf: pf.toFixed(2), vf: Math.floor(vf),
            deltaP: deltaP.toFixed(2), deltaV: Math.floor(deltaV),
            netLimit: netLimit.toFixed(2), ePl: ePl.toFixed(2)
        }, maxBasinc
    };
}

window.Presiyometre = {
    interpolate, basincDagilimi, hesaplaHidrostatikBasinc,
    hesaplaHacimDuzeltmesi, hesaplaMebranDuzeltmesi,
    getElastisiteModulu, getPiPfIndices, hacimOlcerVerisi,
    hesaplaRapor, MEBRAN_HACIM, MEBRAN_BASINC
};
