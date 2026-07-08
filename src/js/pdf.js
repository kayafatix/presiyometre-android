/**
 * PDF oluşturma modülü (html2pdf.js kullanır)
 */

function downloadFoyPDF(idx, kuyu, derinlik) {
    const element = document.getElementById('foy_' + idx);
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const filename = kuyu + '_' + derinlik + 'm_' + dd + '_' + mm + '_' + yy + '.pdf';

    // Toolbar gizle
    const toolbars = element.querySelectorAll('.foy-toolbar');
    toolbars.forEach(t => t.style.display = 'none');

    const opt = {
        margin: [5, 5, 5, 5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(function () {
        toolbars.forEach(t => t.style.display = '');
    });
}

function downloadAllPDF() {
    const allFoys = document.querySelectorAll('.rapor-sayfa');
    const topBar = document.querySelector('.top-toolbar');

    document.querySelectorAll('.foy-toolbar').forEach(t => t.style.display = 'none');
    if (topBar) topBar.style.display = 'none';

    const wrapper = document.createElement('div');
    allFoys.forEach(function (foy, i) {
        const clone = foy.cloneNode(true);
        if (i < allFoys.length - 1) {
            clone.style.pageBreakAfter = 'always';
        }
        wrapper.appendChild(clone);
    });

    const opt = {
        margin: [5, 5, 5, 5],
        filename: 'Presiyometre_Rapor_Tumu.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], after: '.rapor-sayfa' }
    };

    html2pdf().set(opt).from(wrapper).save().then(function () {
        document.querySelectorAll('.foy-toolbar').forEach(t => t.style.display = '');
        if (topBar) topBar.style.display = '';
    });
}
