import React from "react";
import { useCompanyStore } from "../../../store/companyStore";
import CustomInputBox from "./CustomInputBox";

interface SelectedCompanyProps {
  editing: boolean | null;
  handleSelectChange: (name: string, value: string) => void;
  companyId: string;
}

const SelectedCompany: React.FC<SelectedCompanyProps> = ({}) => {
  const { defaultSelected } = useCompanyStore();

  return (
    <CustomInputBox
      label="Company"
      placeholder="e.g., ABC Agents"
      name="companyName"
      value={defaultSelected?.namePrint || ""}
      readOnly
    />
  );
};

export default SelectedCompany;
