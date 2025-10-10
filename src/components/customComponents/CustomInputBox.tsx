import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';

interface CustomInputBoxProps {
  label?: string;
  placeholder: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  type?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
}

function CustomInputBox({
  label,
  placeholder,
  name,
  value,
  onChange,
  maxLength,
  type,
  required = false,
  leftIcon,
  rightIcon,
  autoComplete = "on",
  autoCorrect = "on",
  spellCheck = true,
}: CustomInputBoxProps) {
  const [isVisible, setIsVisible] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (isVisible ? 'text' : 'password') : (type || 'text');

  const passwordRightIcon = isPassword ? (
    <button
      type="button"
      onClick={() => setIsVisible(!isVisible)}
      className="text-gray-400 hover:text-gray-600"
    >
      {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
    </button>
  ) : rightIcon;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-800 flex items-center gap-1"
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
          value={value?.toString()}
          onChange={onChange}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          className={`h-12 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:bg-white transition-all shadow-sm ${
            leftIcon ? 'pl-12' : 'pl-4'
          } ${passwordRightIcon || rightIcon ? 'pr-12' : 'pr-4'}`}
        />
        {passwordRightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {passwordRightIcon}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomInputBox;