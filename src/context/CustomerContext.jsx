import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerTransactions,
  createCustomerTransaction,
} from "../helpers/api/customers";

const CustomerContext = createContext();

export const useCustomerData = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "all", item: "all" });

  // Fetch customers with filters and pagination
  const fetchCustomers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data, total } = await getCustomers({
        page: params.page || pagination.page,
        pageSize: params.pageSize || pagination.pageSize,
        search: params.search ?? filters.search,
        status: params.status ?? filters.status,
        item: params.item ?? filters.item,
        ...params,
      });
      setCustomers(data);
      setPagination((prev) => ({ ...prev, total: total || data.length }));
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // CRUD methods
  const addCustomer = async (customerData) => {
    const newCustomer = await createCustomer(customerData);
    fetchCustomers();
    return newCustomer;
  };

  const editCustomer = async (id, customerData) => {
    const updated = await updateCustomer(id, customerData);
    fetchCustomers();
    return updated;
  };

  const removeCustomer = async (id) => {
    await deleteCustomer(id);
    fetchCustomers();
  };

  // For customer details and transactions
  const fetchCustomerDetails = async (id) => getCustomer(id);
  const fetchCustomerTransactions = async (customerId, params) => getCustomerTransactions(customerId, params);
  const addCustomerTransaction = async (customerId, transactionData) => createCustomerTransaction(customerId, transactionData);

  // Filter and pagination setters
  const setPage = (page) => setPagination((prev) => ({ ...prev, page }));
  const setPageSize = (pageSize) => setPagination((prev) => ({ ...prev, pageSize }));
  const setSearch = (search) => setFilters((prev) => ({ ...prev, search }));
  const setStatus = (status) => setFilters((prev) => ({ ...prev, status }));
  const setItem = (item) => setFilters((prev) => ({ ...prev, item }));

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        pagination,
        filters,
        fetchCustomers,
        addCustomer,
        editCustomer,
        removeCustomer,
        fetchCustomerDetails,
        fetchCustomerTransactions,
        addCustomerTransaction,
        setPage,
        setPageSize,
        setSearch,
        setStatus,
        setItem,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}; 