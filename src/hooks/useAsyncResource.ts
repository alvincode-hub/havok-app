import { useEffect, useRef, useState } from "react";

import { getUserFacingErrorMessage } from "@/src/utils/errors";

interface AsyncResourceState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencyKey?: string | number | null,
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
      .then((result) => {
        if (!isActive) {
          return;
        }

        setData(result);
      })
      .catch((caughtError: unknown) => {
        if (!isActive) {
          return;
        }

        setError(getUserFacingErrorMessage(caughtError));
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
