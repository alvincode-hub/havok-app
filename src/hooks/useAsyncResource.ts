import { useEffect, useRef, useState } from "react";

interface AsyncResourceState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencyKey?: string | number | null
): AsyncResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result: T) => {
        if (!isActive) {
          return;
        }

        setData(result);
      })
      .catch((caughtError: unknown) => {
        if (!isActive) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Une erreur inconnue est survenue.";

        setError(message);
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [dependencyKey, reloadToken]);

  return {
    data,
    error,
    isLoading,
    refresh() {
      setReloadToken((currentValue) => currentValue + 1);
    },
  };
}
