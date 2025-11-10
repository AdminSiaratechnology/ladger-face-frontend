const ToggleSwitch = ({ title, checked, onChange }: any) => {
  return (
    <label className="flex items-center justify-between w-full max-w-[200px] py-1 cursor-pointer">
      <span className="text-gray-700 text-sm font-medium">{title}</span>

      <div
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition 
        ${checked ? "bg-blue-500" : "bg-gray-300"}`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? "translate-x-5" : "translate-x-1"}`}
        ></span>
      </div>
    </label>
  );
};
export default ToggleSwitch;