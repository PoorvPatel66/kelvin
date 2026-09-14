import { useEffect, useState } from 'react';
import { fetchPublishedPage } from '../services/pageService.js';

export function usePublishedPage(identifier) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublishedPage(identifier, { signal: controller.signal })
      .then(setPage)
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setPage(null);
      });

    return () => controller.abort();
  }, [identifier]);

  return page;
}
