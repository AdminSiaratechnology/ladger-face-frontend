interface Checkbox {
  title: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
}

const CheckboxWithLabel = ({ title, onChange, checked }: Checkbox) => {
  return (
    <div className="flex items-center gap-2 w-[150px] mb-2">
         <input
        type="checkbox"
        className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
        onChange={onChange}
        checked={checked}
      />
      <label className="font-semibold text-xs text-gray-900">{title}</label>
     
    </div>
  );
};

export default CheckboxWithLabel;
