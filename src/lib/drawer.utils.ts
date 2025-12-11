export const getDrawerCash = () => {
  return Number(localStorage.getItem("drawerCash") || 0);
};

export const setDrawerCash = (value: number) => {
  localStorage.setItem("drawerCash", String(value));
};

export const increaseDrawerCash = (amount: number) => {
  const current = getDrawerCash();
  const updated = current + amount;
  setDrawerCash(updated);
  return updated;
};
