import React from "react";
import { useCompanyStore } from "../../../store/companyStore";
import CustomInputBox from "./CustomInputBox";

interface SelectedCompanyProps {
  editing: boolean | null;
  handleSelectChange: (name: string, value: string) => void;
  companyId: string;
}

const SelectedCompany: React.FC<SelectedCompanyProps> = ({
  editing,
  handleSelectChange,
  companyId,
}) => {
  const { defaultSelected, companies } = useCompanyStore();

  const selectedCompany =
    companies.find((c) => c._id === (defaultSelected || companyId)) || null;

  return (
    <>
      {editing ? (
        <CustomInputBox
          label="Company"
          placeholder="e.g., ABC Agents"
          name="companyName"
          value={selectedCompany?.namePrint || ""}
          readOnly
        />
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Agent Company
          </label>
          <select
            value={companyId}
            onChange={(e) =>
              handleSelectChange("companyId" as keyof AgentForm, e.target.value)
            }
            className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
          >
            <option value="">Select Agent Company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.namePrint}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

export default SelectedCompany;
