import { useEffect, useRef, useState, createRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  imagePlugin,
  quotePlugin,
  linkDialogPlugin,
  markdownShortcutPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  ListsToggle,
  toolbarPlugin,
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';
import './mdx-editor.css';
export default function EditorWrapper(props) {
  const { field, value } = props;
  const [markdown, setMarkdown] = useState(value);
  const inputRef = createRef();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = markdown;
    }
  }, [markdown]);
  return (
    <>
      <MDXEditor
      client:only="react"
      markdown={markdown}
      className="dark-theme dark-editor" 
      contentEditableClassName="prose editor-textbox"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        imagePlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CreateLink />
              <InsertImage />
              <ListsToggle />
            </>
          )
        })
      ]}
      onChange={setMarkdown}
    />
    <input
        ref={inputRef}
        type="hidden"
        name={field.key}
        value={markdown}
        readOnly
      />
    </>
  );
}
