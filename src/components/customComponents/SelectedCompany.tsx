import React from "react";

import { useCompanyStore } from "../../../store/companyStore";
import CustomInputBox from "./CustomInputBox";
const SelectedCompany = () => {
  const { defaultSelected, companies } = useCompanyStore();
  console.log(defaultSelected)
  console.log(companies)
  const company= companies.filter((company)=>company._id === defaultSelected)
  console.log(company)

  return (
    <>
      <CustomInputBox
        label="Company"
        placeholder="e.g., ABC Agents"
        name="agentName"
        value={company[0]?.namePrint || ""}
      />
    </>
  );
};

export default SelectedCompany;
