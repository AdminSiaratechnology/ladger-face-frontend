import { Input } from '../ui/input'

interface CustomInputBoxProps {
  label?: string;
  placeholder: string;
  name: string;
  value: string |number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  type?: string;
}

function CustomInputBox({
  label,
  placeholder,
  name,
  value,
  onChange,
  maxLength,
  type,
}: CustomInputBoxProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Input
        id={name}
        type={type || 'text'}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className=" border  border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white "
      />
    </div>
  )
}

export default CustomInputBox
