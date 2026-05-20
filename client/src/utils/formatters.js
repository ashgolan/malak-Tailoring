export const fmt = (n) =>
  Number(n || 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });

export const fo = (e, color) => {
  e.target.style.borderColor = color;
};

export const bl = (e) => {
  e.target.style.borderColor = "#e5e7eb";
};

export const today = () => new Date().toISOString().split("T")[0];
