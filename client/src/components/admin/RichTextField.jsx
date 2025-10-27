// client/src/components/admin/RichTextField.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MdFormatBold, MdFormatItalic, MdFormatListBulleted, MdFormatListNumbered } from 'react-icons/md';

// Barra de herramientas simplificada para los campos del formulario
const MiniToolbar = ({ editor }) => {
  if (!editor) return null;

  const Button = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-macrosad-pink text-white' : 'hover:bg-gray-200'}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-1 border-b border-gray-300 bg-gray-50">
      <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrita"><MdFormatBold size={18} /></Button>
      <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Cursiva"><MdFormatItalic size={18} /></Button>
      <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista"><MdFormatListBulleted size={18} /></Button>
      <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Lista numerada"><MdFormatListNumbered size={18} /></Button>
    </div>
  );
};


const RichTextField = ({ content, onUpdate, className = 'min-h-[120px]' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Desactivamos funcionalidades que no necesitamos para mantenerlo simple
        blockquote: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        heading: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none p-3 focus:outline-none ${className}`,
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-md">
      <MiniToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextField;