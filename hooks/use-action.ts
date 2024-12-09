import { useState, useCallback } from "react";
import { ActionState, FieldErrors } from "@/lib/create-safe-action";

export type Action<TInput, TOutput> = (
  data: TInput
) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TInput, TOutput> {
  onProceed?: () => void;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
  onFieldError?: (errors: FieldErrors<TInput>) => void;
}

export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOptions<TInput, TOutput> = {}
) => {
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (input: TInput) => {
      // Explicitly set loading to true before any action
      setIsLoading(true);

      // Reset previous state
      setFieldErrors(undefined);
      setError(undefined);
      setData(undefined);

      // Call onProceed with loading state definitely true
      try {
        options.onProceed?.();

        // Await the action explicitly
        const result = await action(input);

        // If no result, ensure loading is set to false
        if (!result) {
          setIsLoading(false);
          return;
        }

        // Handle field errors
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          options.onFieldError?.(result.fieldErrors);
          setIsLoading(false);
          return;
        }

        // Handle error
        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
          setIsLoading(false);
          return;
        }

        // Handle successful data
        if (result.data) {
          setData(result.data);
          options.onSuccess?.(result.data);
        }
      } catch (err) {
        // Catch any unexpected errors
        setError(String(err));
        options.onError?.(String(err));
      } finally {
        // Ensure loading is set to false
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options]
  );

  return {
    execute,
    fieldErrors,
    error,
    data,
    isLoading,
  };
};
