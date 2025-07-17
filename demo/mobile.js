import { KancilComponent, getLoaderStore } from '../src/kancil.js';

// Simulasi store loader
getLoaderStore().set('loading', false);

// Komponen konten
const KontenComponent = new KancilComponent({
    target: '#konten',
    state: { halaman: 'Beranda' },
    template: `<h2>{{halaman}}</h2><p>Selamat datang di aplikasi demo Kancil!</p>`,
});
KontenComponent.render();

// Komponen title bar
const TitleComponent = new KancilComponent({
    target: '#page-title',
    state: { title: 'Beranda' },
    template: `{{title}}`,
});
TitleComponent.render();

// Event handler navigasi bawah
document.querySelectorAll('.bottom-nav .nav-item').forEach(el => {
    el.addEventListener('click', () => {
        // Update tampilan aktif
        document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        el.classList.add('active');

        // Ambil halaman
        const page = el.dataset.page;
        const title = page.charAt(0).toUpperCase() + page.slice(1);

        // Update konten
        KontenComponent.setState({ halaman: title });
        TitleComponent.setState({ title });
    });
});
