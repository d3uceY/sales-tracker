import { authAxios } from "./auth"

export const uploadBusinessLogo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // You can add other business fields here if needed
  return await authAxios.post("/business/logo", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}
