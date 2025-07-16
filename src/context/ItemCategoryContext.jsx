import { createContext, useContext, useState } from "react";

const initialCategories = [
  { id: 1, name: "Laptop", description: "Laptop computers and accessories", active: true },
  { id: 2, name: "Phone", description: "Mobile phones and smartphones", active: true },
  { id: 3, name: "Dollar", description: "USD currency transactions", active: true },
  { id: 4, name: "Tablet", description: "Tablet devices and accessories", active: false },
  { id: 5, name: "Other", description: "Miscellaneous items", active: true },
];

const ItemCategoryContext = createContext();

export const useItemCategories = () => useContext(ItemCategoryContext);

export const ItemCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(initialCategories);

  const fetchCategories = () => categories;

  const addCategory = (categoryData) => {
    const newCategory = {
      id: Math.max(...categories.map((c) => c.id)) + 1,
      ...categoryData,
      active: true,
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  return (
    <ItemCategoryContext.Provider value={{ categories, fetchCategories, addCategory }}>
      {children}
    </ItemCategoryContext.Provider>
  );
}; 