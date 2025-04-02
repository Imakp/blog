import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import { Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import CodeBlock from "@tiptap/extension-code-block";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import History from "@tiptap/extension-history";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "tiptap-markdown";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaImage,
  FaLink,
  FaCode,
  FaTable,
  FaSun,
  FaMoon,
  FaHighlighter,
  FaUndo,
  FaRedo,
  FaYoutube,
} from "react-icons/fa";
import { Heading1, Heading2, Heading3 } from "lucide-react";

const Editor = ({
  isDark,
  setIsDark,

  onContentChange,
  value = "",
}) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const updateWordCount = useCallback((editor) => {
    const text = editor.state.doc.textContent;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
        bulletList: false,
        orderedList: false,
        heading: false,
        codeBlock: false,
      }),

      History,
      BulletList.configure({
        HTMLAttributes: { class: "pl-6 list-disc" },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: "pl-6 list-decimal" },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Youtube.configure({
        inline: false,
        controls: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4 dark:brightness-90",
        },
        addPasteRules: true,
        parseHTML() {
          return [
            {
              tag: "div[data-youtube-video] iframe",
              getAttrs: (domNode) => {
                const iframe =
                  domNode instanceof HTMLIFrameElement
                    ? domNode
                    : domNode.querySelector("iframe");
                if (
                  iframe &&
                  (iframe.src.includes("youtube.com") ||
                    iframe.src.includes("youtu.be"))
                ) {
                  return { src: iframe.src };
                }
                return false;
              },
            },
            {
              tag: 'iframe[src*="youtube.com"], iframe[src*="youtu.be"]',
              getAttrs: (domNode) => {
                if (domNode instanceof HTMLIFrameElement) {
                  return { src: domNode.src };
                }
                return false;
              },
            },
            {
              tag: 'div > iframe[src*="youtube.com"], div > iframe[src*="youtu.be"]',
              getAttrs: (domNode) => {
                if (domNode instanceof HTMLIFrameElement) {
                  return { src: domNode.src };
                }
                return false;
              },
            },
          ];
        },
      }),

      Image.configure({
        HTMLAttributes: { class: "rounded-lg my-4 shadow-md max-w-full" },
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class:
            "text-blue-600 hover:text-blue-800 underline transition-colors",
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      CodeBlock.configure({
        HTMLAttributes: {
          class:
            "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 text-sm p-4 rounded-lg my-2 overflow-x-auto",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "dark:border-gray-600",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "dark:border-gray-600",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "dark:bg-gray-700 dark:text-white",
        },
      }),
      TableRow,
      Placeholder.configure({
        placeholder: "Begin writing your story...",
      }),
      Markdown,
    ],
    content: value,
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[300px] px-6 py-4 max-w-3xl mx-auto leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      updateWordCount(editor);
    },
  });

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  const addYoutubeVideo = () => {
    const url = prompt("Enter YouTube URL:");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    editor.chain().focus().setColor(color).run();
  };

  useEffect(() => {
    if (editor && value) {
      console.log("Setting editor content from value");
      if (value.includes("youtube.com") || value.includes("youtu.be")) {
        console.log("Found YouTube content in value");
      }

      if (value !== editor.getHTML()) {
        editor.commands.setContent(value);

        setTimeout(() => {
          updateWordCount(editor);
        }, 100);
      }
    }
  }, [value, editor, updateWordCount]);

  useEffect(() => {
    if (!editor) return;

    let saveTimeout;
    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem("blog-content", editor.getHTML());
        setAutoSaveStatus("Autosaved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
        if (onContentChange) onContentChange(editor.getHTML());
      }, 1000);
    };

    editor.on("update", handleChange);
    return () => {
      editor.off("update", handleChange);
      clearTimeout(saveTimeout);
    };
  }, [editor, onContentChange]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!editor) return null;

  const MenuButton = ({ onClick, active, icon: Icon, tooltip }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      title={tooltip}
    >
      <Icon
        className={`w-4 h-4 ${
          active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-300"
        }`}
      />
    </motion.button>
  );

  const ToolbarGroup = ({ children }) => (
    <div className="flex items-center justify-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
      {children}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-[400px] h-full flex flex-col rounded-xl shadow-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden`}
    >
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 p-2 backdrop-blur-md bg-white/90 dark:bg-gray-900/90
                      border-b border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {showToolbar && (
                <>
                  <ToolbarGroup>
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      active={editor.isActive("bold")}
                      icon={FaBold}
                      tooltip="Bold (⌘B)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      active={editor.isActive("italic")}
                      icon={FaItalic}
                      tooltip="Italic (⌘I)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      active={editor.isActive("underline")}
                      icon={FaUnderline}
                      tooltip="Underline (⌘U)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      active={editor.isActive("codeBlock")}
                      icon={FaCode}
                      tooltip="Code Block"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
                    {[1, 2, 3].map((level) => (
                      <MenuButton
                        key={level}
                        onClick={() =>
                          editor.chain().focus().toggleHeading({ level }).run()
                        }
                        active={editor.isActive("heading", { level })}
                        icon={[Heading1, Heading2, Heading3][level - 1]}
                        tooltip={`Heading ${level}`}
                      />
                    ))}
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      active={editor.isActive("bulletList")}
                      icon={FaListUl}
                      tooltip="Bullet List"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      active={editor.isActive("orderedList")}
                      icon={FaListOl}
                      tooltip="Numbered List"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <MenuButton
                      onClick={addImage}
                      icon={FaImage}
                      tooltip="Insert Image"
                    />
                    <MenuButton
                      onClick={addLink}
                      active={editor.isActive("link")}
                      icon={FaLink}
                      tooltip="Insert Link"
                    />
                    <MenuButton
                      onClick={addTable}
                      icon={FaTable}
                      tooltip="Insert Table"
                    />
                    <MenuButton
                      onClick={addYoutubeVideo}
                      icon={FaYoutube}
                      tooltip="Insert YouTube Video"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      title="Text Color"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleHighlight().run()
                      }
                      active={editor.isActive("highlight")}
                      icon={FaHighlighter}
                      tooltip="Highlight Text"
                    />
                  </ToolbarGroup>
                  {/* Removed ToolbarGroup wrapper for Undo/Redo to remove the divider */}
                  <div className="flex items-center justify-center gap-1">
                    <MenuButton
                      onClick={() => editor.chain().focus().undo().run()}
                      icon={FaUndo}
                      tooltip="Undo"
                    />
                    <MenuButton
                      onClick={() => editor.chain().focus().redo().run()}
                      icon={FaRedo}
                      tooltip="Redo"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className=""
        >
          <EditorContent
            editor={editor}
            className={`prose prose-headings:text-left prose-lg max-w-none
              px-6 py-4 mx-auto leading-relaxed pb-16
              prose-table:border-collapse prose-td:p-2 prose-th:p-2
              prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-600
              ${isDark ? "dark:prose-invert" : ""}`}
          />
        </motion.div>
      </div>

      <div
        className="flex-shrink-0 px-4 py-2 border-t border-gray-200 dark:border-gray-700
                  flex justify-between items-center text-sm text-gray-500 dark:text-gray-400
                  backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
      >
        <div>{wordCount} words</div>
        <AnimatePresence>
          {autoSaveStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {autoSaveStatus}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <MenuButton
            onClick={() => setIsDark(!isDark)}
            icon={isDark ? FaSun : FaMoon}
            tooltip="Toggle Theme"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Editor;
