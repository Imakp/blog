import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import CodeBlock from "@tiptap/extension-code-block";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import Collaboration from "@tiptap/extension-collaboration";
import Heading from "@tiptap/extension-heading";
import Mention from "@tiptap/extension-mention";
import OrderedList from "@tiptap/extension-ordered-list";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "tiptap-markdown";
import * as Y from "yjs";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Table as TableIcon,
  Sun,
  Moon,
  Save,
  FileDown,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  RotateCcw,
  RotateCw,
  X,
  ChevronDown,
  Youtube as YoutubeIcon,
  User,
  FilePlus,
} from "lucide-react";

const Editor = ({
  isDark,
  setServerBlogs,
  showPublishButton = true,
  onContentChange,
  value = "", // Add this prop
}) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [saveStatus, setSaveStatus] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const [showExtendedTools, setShowExtendedTools] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const ydoc = new Y.Doc();

  const [isNewPost, setIsNewPost] = useState(true);

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
        // Disable extensions included elsewhere to avoid duplicates
        history: false, // Collaboration has its own history
        bulletList: false,
        orderedList: false,
        heading: false,
        codeBlock: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      // Add customized extensions
      BulletList.configure({
        HTMLAttributes: { class: "pl-6 list-disc" },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: "pl-6 list-decimal" },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention bg-blue-100 px-1 rounded cursor-pointer",
        },
        suggestion: {
          items: ({ query }) => {
            return ["user1", "user2", "user3"].filter((item) =>
              item.includes(query)
            );
          },
          render: () => ({
            onStart: (props) => {
              props.reference.classList.add("mention-active");
            },
            onUpdate(props) {
              props.reference.classList.add("mention-active");
            },
            onExit() {},
            onKeyDown(props) {
              return false;
            },
          }),
        },
      }),
      Youtube.configure({
        inline: false,
        controls: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4 dark:brightness-90",
        },
      }),
      // Youtube.configure({
      //   inline: false,
      //   HTMLAttributes: {
      //     class: "w-full aspect-video rounded-lg my-4",
      //   },
      //   renderHTML: ({ HTMLAttributes }) => {
      //     return [
      //       "div",
      //       { class: "relative aspect-video w-full my-4" },
      //       [
      //         "iframe",
      //         {
      //           ...HTMLAttributes,
      //           width: "560",
      //           height: "315",
      //           frameborder: "0",
      //           title: "YouTube video player",
      //           allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      //           referrerpolicy: "strict-origin-when-cross-origin",
      //           allowfullscreen: true,
      //           src: `https://www.youtube.com/embed/${HTMLAttributes.src}${HTMLAttributes.src.includes('?') ? '&' : '?'}si=PWwj1XSuFBhz6b8u`,
      //         },
      //       ],
      //     ];
      //   },
      // }),
      Markdown,
      Image.configure({
        HTMLAttributes: { class: "rounded-lg my-4 shadow-md max-w-full" },
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 hover:text-blue-800 underline transition-colors",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      CodeBlock.configure({
        HTMLAttributes: { class: "bg-gray-800 text-gray-100 p-4 rounded-lg" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "dark:border-gray-600", // Add dark mode border
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "dark:border-gray-600", // Add dark mode border
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "dark:bg-gray-700 dark:text-white", // Header background
        },
      }),
      TableRow,
      Placeholder.configure({
        placeholder: "Begin writing your story...",
      }),
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

  // const addYoutubeVideo = () => {
  //   const url = prompt("Enter YouTube URL:");
  //   if (!url) return;

  //   // Regular expression to match different YouTube URL formats
  //   const regExp =
  //     /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})(?:\S+)?$/;
  //   const match = url.match(regExp);

  //   if (!match) {
  //     alert("Please enter a valid YouTube URL");
  //     return;
  //   }

  //   const videoId = match[1];
  //   editor.chain().focus().setYoutubeVideo({ src: videoId }).run();
  // };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const exportToPDF = () => {
    const content = editor.getText();
    const pdf = new jsPDF();
    pdf.text(content, 10, 10);
    pdf.save("document.pdf");
  };

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;

    let saveTimeout;
    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem("blog-content", editor.getHTML());
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
        if (onContentChange) onContentChange(editor.getHTML()); // Add this line
      }, 1000);
    };

    editor.on("update", handleChange);
    return () => {
      editor.off("update", handleChange);
      clearTimeout(saveTimeout);
    };
  }, [editor, onContentChange]);

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

  const handleNewPost = () => {
    setIsNewPost(true);
    editor.commands.clearContent();
    localStorage.removeItem("blog-content");
  };

  const handlePublish = async () => {
    const title = prompt("Enter post title:");
    const metaDescription = prompt("Enter meta description:");
    const keywords = prompt("Enter comma-separated keywords:");

    if (!title || !metaDescription || !keywords) {
      return alert("All SEO fields are required!");
    }

    const newPost = {
      title,
      content: editor.getHTML(),
      metaDescription,
      keywords: keywords.split(",").map((k) => k.trim()),
    };

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedPost = await response.json();
      setServerBlogs((prev) => [savedPost, ...prev.blogs]);

      // Clear localStorage and editor content after successful publish
      localStorage.removeItem("blog-content");
      editor.commands.clearContent();
      setIsNewPost(true);

      navigate(`/post/${savedPost.slug}`);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Check console for details.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`h-[80vh] flex flex-col rounded-xl shadow-xl ${
        theme === "light"
          ? "bg-white text-gray-900"
          : "bg-gray-900 text-gray-100"
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowToolbar(!showToolbar)}
        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 
                   hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md"
      >
        {showToolbar ? (
          <X className="w-4 h-4" />
        ) : (
          <Palette className="w-4 h-4" />
        )}
      </motion.button>

      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            // exit={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-30 p-2 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 
                     border-b border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              <ToolbarGroup>
                <MenuButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive("bold")}
                  icon={Bold}
                  tooltip="Bold (⌘B)"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive("italic")}
                  icon={Italic}
                  tooltip="Italic (⌘I)"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={editor.isActive("underline")}
                  icon={UnderlineIcon}
                  tooltip="Underline (⌘U)"
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
                  icon={List}
                  tooltip="Bullet List"
                />
                <MenuButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  active={editor.isActive("orderedList")}
                  icon={ListOrdered}
                  tooltip="Numbered List"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  active={editor.isActive("taskList")}
                  icon={CheckSquare}
                  tooltip="Task List"
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <MenuButton
                  onClick={addImage}
                  icon={ImageIcon}
                  tooltip="Insert Image"
                />
                <MenuButton
                  onClick={addLink}
                  active={editor.isActive("link")}
                  icon={LinkIcon}
                  tooltip="Insert Link"
                />
                <MenuButton
                  onClick={addTable}
                  icon={TableIcon}
                  tooltip="Insert Table"
                />
                <MenuButton
                  onClick={addYoutubeVideo}
                  icon={YoutubeIcon}
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
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  active={editor.isActive("highlight")}
                  icon={Highlighter}
                  tooltip="Highlight Text"
                />
              </ToolbarGroup>
              <ToolbarGroup>
                {showPublishButton && (
                  <MenuButton
                    onClick={handlePublish}
                    active={false}
                    icon={Save}
                    tooltip="Publish Post"
                  />
                )}
                <MenuButton
                  onClick={exportToPDF}
                  icon={FileDown}
                  tooltip="Export to PDF"
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <MenuButton
                  onClick={() => editor.chain().focus().undo().run()}
                  icon={RotateCcw}
                  tooltip="Undo"
                />
                <MenuButton
                  onClick={() => editor.chain().focus().redo().run()}
                  icon={RotateCw}
                  tooltip="Redo"
                />
                <MenuButton
                  onClick={handleNewPost}
                  icon={FilePlus}
                  tooltip="New Post"
                />
              </ToolbarGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto"
        >
          <EditorContent
            editor={editor}
            className="prose prose-headings:text-left dark:prose-invert prose-lg max-w-none 
          px-6 py-4 mx-auto leading-relaxed pt-[76px] pb-16
          prose-table:border-collapse prose-td:p-2 prose-th:p-2
          prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-600
          prose-code:before:content-none prose-code:after:content-none" // Add table and code block styling
          />
        </motion.div>
      </div>

      <div
        className="sticky bottom-0 z-20 px-4 py-2 border-t border-gray-200 dark:border-gray-700 
                  flex justify-between items-center text-sm text-gray-500 dark:text-gray-400
                  backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
      >
        <div>{wordCount} words</div>
        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {saveStatus}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <MenuButton
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            icon={theme === "light" ? Moon : Sun}
            tooltip="Toggle Theme"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Editor;
