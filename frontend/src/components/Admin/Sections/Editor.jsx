import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import { Node } from "@tiptap/core";
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
import History from "@tiptap/extension-history";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "tiptap-markdown";
import { jsPDF } from "jspdf";

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
  Code as CodeIcon,
  Table as TableIcon,
  Sun,
  Moon,
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
  Youtube as YoutubeIcon,
  Twitter,
} from "lucide-react";

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

  const TwitterEmbed = Node.create({
    name: "twitterEmbed",
    group: "block",
    atom: true,

    addAttributes() {
      return {
        url: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-tweet-url"),
          renderHTML: (attributes) => {
            if (!attributes.url) {
              return {};
            }
            return { "data-tweet-url": attributes.url };
          },
        },
      };
    },

    parseHTML() {
      return [{ tag: "div[data-tweet-url]" }];
    },

    renderHTML({ HTMLAttributes }) {
      return ["div", HTMLAttributes, 0];
    },

    addNodeView() {
      return ({ node, getPos, editor }) => {
        const { url } = node.attrs;
        const dom = document.createElement("div");
        dom.setAttribute("data-tweet-url", url);
        dom.style.border = "1px solid #ccc";
        dom.style.padding = "10px";
        dom.style.margin = "10px 0";
        dom.style.borderRadius = "4px";
        dom.style.backgroundColor = "#f0f0f0";
        dom.style.color = "#333";
        dom.textContent = `[Twitter Post: ${url || "No URL provided"}]`;
        dom.contentEditable = "false";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.style.marginLeft = "10px";
        deleteButton.style.cursor = "pointer";
        deleteButton.style.border = "none";
        deleteButton.style.background = "red";
        deleteButton.style.color = "white";
        deleteButton.style.borderRadius = "3px";
        deleteButton.style.padding = "2px 5px";
        deleteButton.onclick = () => {
          if (typeof getPos === "function") {
            editor.view.dispatch(
              editor.view.state.tr.delete(getPos(), getPos() + node.nodeSize)
            );
          }
        };
        dom.appendChild(deleteButton);

        return { dom };
      };
    },

    addCommands() {
      return {
        setTwitterEmbed:
          (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          },
      };
    },
  });

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
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
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
      TaskList,
      TaskItem.configure({ nested: true }),
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
      TwitterEmbed,
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

  const addTwitterEmbed = () => {
    const url = prompt("Enter Tweet URL:");
    if (url) {
      editor.chain().focus().setTwitterEmbed({ url }).run();
    }
  };

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
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowToolbar(!showToolbar)}
                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
                title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
              >
                {showToolbar ? (
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </motion.button>
              {showToolbar && (
                <>
                  <ToolbarGroup>
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                      }
                      active={editor.isActive({ textAlign: "left" })}
                      icon={AlignLeft}
                      tooltip="Align Left"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                      }
                      active={editor.isActive({ textAlign: "center" })}
                      icon={AlignCenter}
                      tooltip="Align Center"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                      }
                      active={editor.isActive({ textAlign: "right" })}
                      icon={AlignRight}
                      tooltip="Align Right"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      active={editor.isActive("bold")}
                      icon={Bold}
                      tooltip="Bold (⌘B)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      active={editor.isActive("italic")}
                      icon={Italic}
                      tooltip="Italic (⌘I)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      active={editor.isActive("underline")}
                      icon={UnderlineIcon}
                      tooltip="Underline (⌘U)"
                    />
                    <MenuButton
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      active={editor.isActive("codeBlock")}
                      icon={CodeIcon}
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
                      onClick={() =>
                        editor.chain().focus().toggleTaskList().run()
                      }
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
                    <MenuButton
                      onClick={addTwitterEmbed}
                      icon={Twitter}
                      tooltip="Embed Tweet"
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
                      icon={Highlighter}
                      tooltip="Highlight Text"
                    />
                  </ToolbarGroup>
                  <ToolbarGroup>
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
                  </ToolbarGroup>
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
            icon={isDark ? Sun : Moon}
            tooltip="Toggle Theme"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Editor;
