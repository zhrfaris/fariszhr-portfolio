/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";

import FormErrors from "./form-errors";
import React, { forwardRef, useRef, useState } from "react";

interface FormTextEditorProps {
  id: string;
  label?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  defaultValue?: string;
  height?: number;
  menubar?: boolean;
  plugins?: boolean;
  toolbar?: boolean;
  onBlur?: () => void;
}

const FormTextEditor = forwardRef<HTMLInputElement, FormTextEditorProps>(
  (
    {
      id,
      defaultValue = "",
      label,
      disabled,
      errors,
      required,
      height = 500,
      onBlur,
      menubar = false,
      plugins = true,
      toolbar = true,
    },
    ref
  ) => {
    const editorRef = useRef<TinyMCEEditor | null>(null);

    const [content, setContent] = useState<string | undefined>(defaultValue);

    const changeHandler = () => {
      setContent(editorRef.current?.getContent());
    };

    return (
      <div className="space-y-2 w-full @md:min-w-[400px]">
        <div className="space-y-1">
          {label && (
            <Label
              htmlFor={id}
              className="text-sm font-semibold text-foreground/70"
            >
              <span>{label}</span>
              {required && <span className="text-red-600"> *</span>}
            </Label>
          )}
          <Editor
            id={id}
            onInit={(evt: any, editor: any) => (editorRef.current = editor)}
            apiKey={process.env.NEXT_PUBLIC_TINY_RTE_API_KEY}
            init={{
              menubar,
              plugins: plugins
                ? "anchor autolink codesample emoticons link lists searchreplace visualblocks wordcount linkchecker autoresize"
                : "autoresize",
              toolbar: toolbar
                ? "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | numlist bullist indent outdent | align lineheight | link emoticons  removeformat | spellcheckdialog a11ycheck typography"
                : undefined,
              toolbar_mode: "wrap",
              skin: "snow",
              resize: true,
              min_height: height,
            }}
            initialValue={defaultValue}
            onChange={changeHandler}
          />
          <Input
            onBlur={onBlur}
            value={content}
            onChange={() => {}}
            ref={ref}
            required={required}
            name={id}
            id={id}
            type="hidden"
            disabled={disabled}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormTextEditor.displayName = "FormTextEditor";

export default FormTextEditor;

/*
<p>Insert the content of your post!</p>
<div>
<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe modi ad, dolores blanditiis veniam voluptatem expedita delectus ipsam itaque eveniet sapiente obcaecati natus provident inventore repellendus architecto voluptatum? Rem eius reiciendis sed, magnam eveniet excepturi deleniti dicta quam, cum vel modi consequatur nemo nam quia perferendis voluptatum id molestias officiis sapiente nobis dolor aperiam beatae? Dolor fugiat, asperiores minus sed exercitationem vero non excepturi tenetur provident. Tenetur consequuntur impedit explicabo ex modi odio cum, earum sed rerum ipsa ratione similique quisquam veniam aspernatur. Repudiandae, illum! Nobis debitis non vitae suscipit veritatis natus, blanditiis hic officia! Eligendi reiciendis aliquam pariatur magnam a. Laudantium eveniet velit obcaecati officia modi, magnam expedita impedit accusamus dolor sunt nam ut voluptate fugit est aliquid, officiis odit quos ad accusantium, perspiciatis debitis? Illo harum maxime, libero doloribus adipisci nesciunt beatae cumque velit atque soluta magni deleniti, minima obcaecati perspiciatis sed mollitia dolores commodi? Tempore vel ipsum excepturi ipsa ipsam, cupiditate inventore numquam facilis harum. Facere odit minima consectetur, tempora fuga vitae. Eum possimus, necessitatibus vero velit doloribus quo earum tempore. Fuga, esse dignissimos incidunt ducimus atque perspiciatis saepe enim exercitationem nesciunt voluptatem possimus temporibus iusto quam voluptas velit? Consequuntur, accusantium aperiam voluptates fugit nesciunt ipsam ducimus tenetur vel dolor nulla a possimus, voluptate iste minus sunt rerum. Id eius quas ipsam ut explicabo repellendus, exercitationem commodi ipsum quae neque, sunt aliquam itaque, sequi officia aliquid possimus culpa corrupti facilis. Minima at placeat tempore! Modi omnis quod tempore suscipit itaque voluptatum a. Officia omnis quia amet facere deleniti numquam! Numquam libero ducimus earum? Nostrum suscipit molestias minima pariatur. Totam dolorum repellendus beatae distinctio dolor quaerat dicta necessitatibus dignissimos sed voluptatem, consequatur accusamus aliquam enim quos numquam ipsam cupiditate perspiciatis doloribus incidunt odit excepturi nam autem a? Consectetur hic deserunt sit exercitationem iusto itaque quas aperiam esse eum!</div>
<div>&nbsp;</div>
<div>sdfsdfsdfsdfsdfsdfs</div>
</div>
*/
