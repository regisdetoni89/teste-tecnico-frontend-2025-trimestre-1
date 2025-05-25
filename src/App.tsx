import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Select,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { searchAddressByCep } from './services/api';
import { getAddresses, saveAddress, deleteAddress, updateAddressDisplayName } from './services/storage';
import type { Address, ViaCepResponse } from './types/address';

function App() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [cep, setCep] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const storedAddresses = getAddresses();
    setAddresses(storedAddresses);
    setFilteredAddresses(storedAddresses);
  }, []);

  useEffect(() => {
    let filtered = addresses;

    if (searchTerm) {
      filtered = filtered.filter((address) =>
        address.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity) {
      filtered = filtered.filter((address) => address.localidade === selectedCity);
    }

    if (selectedState) {
      filtered = filtered.filter((address) => address.uf === selectedState);
    }

    setFilteredAddresses(filtered);
  }, [addresses, searchTerm, selectedCity, selectedState]);

  const handleSearch = async () => {
    try {
      const addressData: ViaCepResponse = await searchAddressByCep(cep);
      
      if (addressData.erro) {
        toast({
          title: 'Erro',
          description: 'CEP não encontrado',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newAddress: Address = {
        id: uuidv4(),
        username,
        displayName,
        ...addressData,
      };

      saveAddress(newAddress);
      setAddresses(getAddresses());
      
      toast({
        title: 'Sucesso',
        description: 'Endereço adicionado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setUsername('');
      setDisplayName('');
      setCep('');
    } catch (err: unknown) {
      console.error('Error searching CEP:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar CEP',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
    setAddresses(getAddresses());
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    onOpen();
  };

  const handleUpdateDisplayName = () => {
    if (editingAddress) {
      updateAddressDisplayName(editingAddress.id, editingAddress.displayName);
      setAddresses(getAddresses());
      onClose();
    }
  };

  const cities = Array.from(new Set(addresses.map((a) => a.localidade))).sort();
  const states = Array.from(new Set(addresses.map((a) => a.uf))).sort();

  return (
    <Box p={8}>
      <VStack spacing={8}>
        <Heading>Agenda de Endereços</Heading>

        <HStack spacing={4}>
          <Input
            placeholder="Nome do usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Nome de exibição"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            placeholder="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleSearch}>
            Buscar
          </Button>
        </HStack>

        <HStack spacing={4} w="full">
          <Input
            placeholder="Buscar por nome de exibição"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Filtrar por cidade"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por estado"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Usuário</Th>
              <Th>Nome de Exibição</Th>
              <Th>CEP</Th>
              <Th>Endereço</Th>
              <Th>Cidade</Th>
              <Th>Estado</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAddresses.map((address) => (
              <Tr key={address.id}>
                <Td>{address.username}</Td>
                <Td>{address.displayName}</Td>
                <Td>{address.cep}</Td>
                <Td>{address.logradouro}</Td>
                <Td>{address.localidade}</Td>
                <Td>{address.uf}</Td>
                <Td>
                  <IconButton
                    aria-label="Editar"
                    icon={<EditIcon />}
                    onClick={() => handleEdit(address)}
                    mr={2}
                  />
                  <IconButton
                    aria-label="Excluir"
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(address.id)}
                    colorScheme="red"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Nome de Exibição</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Input
              value={editingAddress?.displayName || ''}
              onChange={(e) =>
                setEditingAddress(
                  editingAddress
                    ? { ...editingAddress, displayName: e.target.value }
                    : null
                )
              }
            />
            <Button mt={4} colorScheme="blue" onClick={handleUpdateDisplayName}>
              Salvar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </Box>
  );
}

export default App;
