export const getDraftBills = () => {
  return JSON.parse(localStorage.getItem("draftBills") || "[]");
};

export const saveDraftBills = (drafts: any[]) => {
  localStorage.setItem("draftBills", JSON.stringify(drafts));
};

export const addDraftBill = (draft: any) => {
  const drafts = getDraftBills();
  drafts.push(draft);
  saveDraftBills(drafts);
  return drafts;
};

export const deleteDraftBill = (id: number) => {
  const drafts = getDraftBills().filter((d: any) => d.id !== id);
  saveDraftBills(drafts);
  return drafts;
};
