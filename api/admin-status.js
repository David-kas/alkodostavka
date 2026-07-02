import { probeBlobStorage, getAdminPassword } from '../lib/catalog-store.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isVercel = Boolean(process.env.VERCEL);
  const hasPassword = Boolean(getAdminPassword());
  const blob = await probeBlobStorage();

  return res.status(200).json({
    ok: true,
    host: isVercel ? 'vercel' : 'local',
    canSave: !isVercel || blob.available,
    storage: blob.mode,
    adminConfigured: hasPassword,
    blob: {
      available: blob.available,
      reason: blob.reason || null,
    },
    hints: isVercel
      ? blob.available
        ? ['Сохранение пишет в Vercel Blob — каталог на сайте обновится без нового деплоя.']
        : [
            'На Vercel диск только для чтения.',
            'Подключите Blob: Vercel → Storage → Create Blob → Connect to project → Redeploy.',
            'Или сохраняйте локально: npm run dev → http://127.0.0.1:3000/admin/',
          ]
      : ['Локальный режим: изменения пишутся в data/catalog.json и catalog.html.'],
  });
}
