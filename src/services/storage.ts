import type { Address } from '../types/address';

const STORAGE_KEY = '@address-book';

export const getAddresses = (): Address[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAddress = (address: Address): void => {
  const addresses = getAddresses();
  const existingIndex = addresses.findIndex((a) => a.id === address.id);

  if (existingIndex >= 0) {
    addresses[existingIndex] = address;
  } else {
    addresses.push(address);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

export const deleteAddress = (id: string): void => {
  const addresses = getAddresses();
  const filteredAddresses = addresses.filter((address) => address.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAddresses));
};

export const updateAddressDisplayName = (id: string, displayName: string): void => {
  const addresses = getAddresses();
  const address = addresses.find((a) => a.id === id);
  
  if (address) {
    address.displayName = displayName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }
}; 