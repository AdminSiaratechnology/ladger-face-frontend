import { Input } from '../ui/input'
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
   autoComplete?:string;
  autoCorrect?:string;
  spellCheck?:boolean;
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
   autoComplete="on",
  autoCorrect="on",
  spellCheck=true,
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
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label} {required && "*"}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
          className={`border border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-500 focus:ring-2 focus:outline-none bg-white ${
            leftIcon ? 'pl-10' : 'pl-3'
          } ${passwordRightIcon || rightIcon ? 'pr-10' : 'pr-3'}`}
        />
        {passwordRightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {passwordRightIcon}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomInputBox