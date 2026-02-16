
import { AppData, Trip, Customer, Expense } from './types';

const STORAGE_KEY = 'carl_app_data_v1';

const INITIAL_DATA: AppData = {
  trips: [],
  customers: [],
  expenses: []
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse storage', e);
    return INITIAL_DATA;
  }
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addTrip = (trip: Trip) => {
  const data = getAppData();
  data.trips.push(trip);
  saveAppData(data);
};

export const updateTrip = (updatedTrip: Trip) => {
  const data = getAppData();
  data.trips = data.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
  saveAppData(data);
};

export const addExpense = (expense: Expense) => {
  const data = getAppData();
  data.expenses.push(expense);
  saveAppData(data);
};

export const addCustomer = (customer: Customer) => {
  const data = getAppData();
  data.customers.push(customer);
  saveAppData(data);
};
