import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from "lucide-react";

import 'prosemirror-view/style/prosemirror.css';

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    autofocus: false,
    editable: true,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* Toolbar */}
      <div className="flex gap-2 border-b border-gray-300 p-2 bg-gray-50 rounded-t-lg flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn ${editor.isActive("bold") ? "active" : ""}`}
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn ${editor.isActive("italic") ? "active" : ""}`}>
          <Italic size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn ${editor.isActive("underline") ? "active" : ""}`}
        >
          <UnderlineIcon size={18} />
        </button>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
        >
          <Heading1 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
        >
          <Heading2 size={18} />
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn ${editor.isActive("bulletList") ? "active" : ""}`}
        >
          <List size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn ${editor.isActive("orderedList") ? "active" : ""}`}
        >
          <ListOrdered size={18} />
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} className="editor-area p-3" />
    </div>
  );
}
