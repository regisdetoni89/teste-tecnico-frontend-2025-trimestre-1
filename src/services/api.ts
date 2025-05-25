import axios from 'axios';
import type { ViaCepResponse } from '../types/address';

const api = axios.create({
  baseURL: 'https://viacep.com.br/ws',
});

export const searchAddressByCep = async (cep: string): Promise<ViaCepResponse> => {
  const response = await api.get<ViaCepResponse>(`/${cep}/json/`);
  return response.data;
}; 