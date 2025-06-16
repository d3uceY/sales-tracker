// Helper function to format dates (e.g., "2025-06-16T15:17:48.156Z" -> "Jun 16, 2025")
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};
