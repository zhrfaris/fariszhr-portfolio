/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

const useCloudinary = () => {
  const onDeleteCloudinaryImage = async (
    public_id: string,
    option?: { onError?: (error: any) => void; onSuccess?: () => void }
  ) => {
    const { onError = () => {}, onSuccess = () => {} } = option || {};

    try {
      const response = await fetch(`/api/image/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // console.log(response);
    } catch (error) {
      console.log(error);
      onError(error);
    } finally {
      onSuccess();
    }
  };

  return { onDeleteCloudinaryImage };
};

export default useCloudinary;
