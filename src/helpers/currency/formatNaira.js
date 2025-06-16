// Helper function to format NGN currency
export const formatNgnCurrency = (amount) => {
  if (typeof amount !== "number") return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};
