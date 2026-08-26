"use client";

import { useCallback } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import styles from "./BlockEditor.module.css";

type Props = {
  initialContent: unknown;
  onChange: (blocks: unknown) => void;
  onUpload: (file: File) => Promise<string>;
};

/* El tema se deriva de los tokens de marca, no de los grises de BlockNote: sin
   esto el editor parece Notion pegado dentro del panel. */
const theme = {
  colors: {
    editor: { text: "#0d1e29", background: "#ffffff" },
    menu: { text: "#0d1e29", background: "#ffffff" },
    tooltip: { text: "#0d1e29", background: "#f0ede8" },
    hovered: { text: "#0d1e29", background: "#f0ede8" },
    selected: { text: "#ffffff", background: "#3f738d" },
    disabled: { text: "#9aa7ae", background: "#f0ede8" },
    shadow: "#e2ddd6",
    border: "#e2ddd6",
    sideMenu: "#9aa7ae",
  },
  borderRadius: 2,
  fontFamily: "var(--font-josefin), Arial, sans-serif",
} as const;

export default function BlockEditor({ initialContent, onChange, onUpload }: Props) {
  const uploadFile = useCallback(async (file: File) => onUpload(file), [onUpload]);

  const editor = useCreateBlockNote({
    // Un documento vacío necesita al menos un bloque o BlockNote no arranca.
    initialContent:
      Array.isArray(initialContent) && initialContent.length > 0
        ? (initialContent as PartialBlock[])
        : [{ type: "paragraph" }],
    uploadFile,
    dictionary: en,
  });

  return (
    <div className={styles.wrap}>
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={() => onChange(editor.document)}
        data-theming-css-variables-demo
      />
    </div>
  );
}
