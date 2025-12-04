import React, { useState, useMemo, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import ReactQuill from "react-quill";
// Import Quill CSS
import "react-quill/dist/quill.snow.css";

type InputType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "date"
  | "richtext"
  | "textarea";

interface CustomInputBoxProps {
  label?: string;
  placeholder: string;
  name: string;
  value: string | number | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
  type?: InputType;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;

  // Rich text specific props
  richTextConfig?: {
    toolbar?: boolean | Array<string>;
    formats?: string[];
    maxHeight?: string;
    minHeight?: string;
    placeholder?: string;
    theme?: "snow" | "bubble";
    modules?: any;
    bounds?: string | HTMLElement;
    scrollingContainer?: string;
  };
}

function CustomInputBox({
  label,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  maxLength,
  type = "text",
  required = false,
  leftIcon,
  rightIcon,
  autoComplete = "on",
  autoCorrect = "on",
  spellCheck = true,
  readOnly = false,
  disabled = false,
  error,
  helperText,
  richTextConfig = {},
}: CustomInputBoxProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPassword = type === "password";
  const isRichText = type === "richtext";
  const isTextArea = type === "textarea";

  const inputType = isPassword
    ? isVisible
      ? "text"
      : "password"
    : type === "richtext" || type === "textarea"
    ? "text"
    : type;

  // Default Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar:
        richTextConfig.toolbar === false
          ? false
          : richTextConfig.toolbar || [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image", "video"],
              ["blockquote", "code-block"],
              ["clean"],
            ],
      clipboard: {
        matchVisual: false,
      },
    }),
    [richTextConfig.toolbar]
  );

  // Default Quill formats
  const quillFormats = useMemo(
    () =>
      richTextConfig.formats || [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
        "align",
        "blockquote",
        "code-block",
      ],
    [richTextConfig.formats]
  );

  const passwordRightIcon = isPassword ? (
    <button
      type="button"
      onClick={() => setIsVisible(!isVisible)}
      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
      aria-label={isVisible ? "Hide password" : "Show password"}
      disabled={disabled}
    >
      {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
    </button>
  ) : (
    rightIcon
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleRichTextChange = (content: string) => {
    if (onChange) {
      onChange(content);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onBlur) {
      onBlur(e as React.FocusEvent<HTMLInputElement>);
    }
  };

  // Render Rich Text Editor
  if (isRichText && isMounted) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={name}
            className={`text-sm font-medium flex items-center gap-1 ${
              error ? "text-red-600" : "text-gray-800"
            }`}
          >
            {label}
            {required && <span className="text-pink-500">*</span>}
          </label>
        )}
        <div className="relative">
          <ReactQuill
            theme={richTextConfig.theme || "snow"}
            value={typeof value === "string" ? value : ""}
            onChange={handleRichTextChange}
            placeholder={richTextConfig.placeholder || placeholder}
            readOnly={readOnly || disabled}
            modules={richTextConfig.modules || quillModules}
            formats={quillFormats}
            bounds={richTextConfig.bounds}
            scrollingContainer={richTextConfig.scrollingContainer}
            className={`bg-white rounded-lg  ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnly || disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            style={{
              minHeight: richTextConfig.minHeight || "200px",
              maxHeight: richTextConfig.maxHeight || "400px",
            }}
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }

  // Render TextArea
  if (isTextArea) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={name}
            className={`text-sm font-medium flex items-center gap-1 ${
              error ? "text-red-600" : "text-gray-800"
            }`}
          >
            {label}
            {required && <span className="text-pink-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-4 text-gray-400">
              {leftIcon}
            </div>
          )}
          <textarea
            id={name}
            placeholder={placeholder}
            name={name}
            value={typeof value === "string" ? value : ""}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={maxLength}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            spellCheck={spellCheck}
            readOnly={readOnly}
            disabled={disabled}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-50/50 border rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:bg-white transition-all shadow-sm resize-vertical ${
              leftIcon ? "pl-12" : "pl-4"
            } ${passwordRightIcon || rightIcon ? "pr-12" : "pr-4"} ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-300"
            } ${
              disabled || readOnly
                ? "cursor-not-allowed bg-gray-100 text-gray-500"
                : ""
            }`}
          />
          {passwordRightIcon && (
            <div className="absolute right-4 top-4">{passwordRightIcon}</div>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }

  // Render Regular Input
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className={`text-sm font-medium flex items-center gap-1 ${
            error ? "text-red-600" : "text-gray-800"
          }`}
        >
          {label}
          {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          name={name}
          value={value?.toString() || ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          readOnly={readOnly}
          disabled={disabled}
          className={`h-12 px-4 py-3 bg-gray-50/50 border rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:bg-white transition-all shadow-sm ${
            leftIcon ? "pl-12" : "pl-4"
          } ${passwordRightIcon || rightIcon ? "pr-12" : "pr-4"} ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-300"
          } ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""} ${
            readOnly ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
          }`}
        />
        {passwordRightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {passwordRightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

export default CustomInputBox;
