export const config = {
  runtime: 'edge',
};

/**
 * Пропускаем все запросы. Ранее десктоп получал 403 — это ломало UX, CRO и часть проверок.
 * Боты и люди получают одинаковый контент (рекомендация Яндекс/Google).
 */
export default function middleware(request) {
  return fetch(request);
}
