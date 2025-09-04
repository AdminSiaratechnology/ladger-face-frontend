
import { Input } from '../ui/input'
interface CustomInputBoxProps {
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  type?: string;
}

function CustomInputBox({placeholder,name,value,onChange,maxLength,type}:CustomInputBoxProps) {
  return (
     <Input
            type={type || "text"}
      placeholder={placeholder}
      name={name}
      value={value}
    
      onChange={onChange} // This must be passed down!
            maxLength={maxLength}
              className="border-teal-200 focus:border-teal-500  !ring-teal-100   border-1"

          />
  )
}

export default CustomInputBox