import { Action, useAction } from "@/hooks/use-action";
import { useCallback, useEffect, useState } from "react";
import { FormComboboxBaseData, UnassignInput } from "./form-combobox";
import { toast } from "sonner";
import slugify from "react-slugify";

interface useFormComboboxProps<TData extends FormComboboxBaseData> {
  getData: Action<object, TData[]>;
  onUnassign: Action<UnassignInput, { message: string }>;
  initialSelected?: string[];
  parentId?: string;
  onUpdateSelected: (selected: string[]) => void;
}

export const useFormCombobox = <TData extends FormComboboxBaseData>({
  getData,
  onUnassign,
  onUpdateSelected,
  parentId,
  initialSelected = [],
}: useFormComboboxProps<TData>) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSideFormShown, setIsSideFormShown] = useState(false);

  const [searchValue, setSearchValue] = useState<string>("");

  const [listOption, setListOption] = useState<TData[]>([]);
  const [listSelected, setListSelected] = useState<TData[]>([]);

  const { execute: getOptionsHandler, isLoading: isLoadingData } = useAction(
    getData,
    {
      onError: (error) => toast.error(error),
      onSuccess: (data) => {
        setListOption(data.filter((d) => !initialSelected.includes(d.id)));
        setListSelected(data.filter((d) => initialSelected.includes(d.id)));
      },
    }
  );

  const { execute: executeUnassign } = useAction(onUnassign, {
    onError: (error) => toast.error(error),
    onSuccess: (data) => {
      console.log({ data });
    },
  });

  const getOptionsHandlerCB = useCallback(
    () => getOptionsHandler({}),
    [getOptionsHandler]
  );

  const onKeyupHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const valueAlreadyExist = listSelected.some(
      (item) => item.id === slugify(searchValue)
    );

    if (searchValue === "" || e.key !== "Enter" || valueAlreadyExist) {
      return;
    }

    setIsSideFormShown(true);
  };

  const onDeleteData = (data: TData) => {
    console.log(data);

    const updateList = () => {
      setListSelected(listSelected.filter((d) => d.id !== data.id));
      onUpdateSelected(
        listSelected
          .filter((d) => d.id !== data.id)
          .map((selected) => selected.id)
      );

      const newOptions = [...listOption];
      newOptions.push(data);
      setListOption(newOptions);
    };

    console.log(parentId);

    if (!!parentId) {
      const onUnassignPromise = new Promise(async (resolve) => {
        await executeUnassign({ id: data.id, parentId });
        resolve("success");
      });

      onUnassignPromise.then(updateList).catch((error) => console.log(error));
      return;
    }

    updateList();
  };

  const onSelectHandler = (data: TData) => {
    // assigning new data to selected data list
    const newSelected = [...listSelected];
    const hasDuplicate = newSelected.some((d) => d.id === data.id);
    if (hasDuplicate) {
      return;
    }

    newSelected.push(data);
    setListSelected(newSelected);
    onUpdateSelected(newSelected.map((selected) => selected.id));

    const newData = listOption.filter(
      (d) => !newSelected.map((s) => s.id).includes(d.id)
    );
    setListOption(newData);
    setSearchValue("");
  };

  const successCreateNew = (newly_data_id: string) => {
    onUpdateSelected([
      ...listSelected.map((selected) => selected.id),
      newly_data_id,
    ]);
    setSearchValue("");
    setIsFirstLoad(true);
    setIsSideFormShown(false);
  };

  const openSheet = () => {
    setIsSideFormShown(true);
  };

  useEffect(() => {
    if (!isFirstLoad) {
      return;
    }

    getOptionsHandlerCB();

    setIsFirstLoad(false);
  }, [getOptionsHandlerCB, isFirstLoad]);

  return {
    listOption,
    isFirstLoad,
    searchValue,
    listSelected,
    isLoadingData,
    isSideFormShown,
    openSheet,
    onDeleteData,
    setSearchValue,
    onKeyupHandler,
    onSelectHandler,
    successCreateNew,
    setIsSideFormShown,
  };
};
