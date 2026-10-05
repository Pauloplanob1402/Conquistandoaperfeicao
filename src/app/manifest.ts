import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Conquistando a Perfeição', short_name: 'Perfeição', description: 'Cultura que entra na rotina da liderança.',
    start_url: '/', display: 'browser', background_color: '#fbfaf8', theme_color: '#a3162b',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  };
}
