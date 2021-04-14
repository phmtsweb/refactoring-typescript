import { Component, useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

const Dashboard = (): JSX.Element => {
  const [foods, setFoods] = useState<FoodDTO[]>([]);
  const [editingFood, setEditingFood] = useState<FoodDTO>({} as FoodDTO);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  useEffect(() => {

    async function loadData() {
      const response = await api.get('/foods');
      const foodData: FoodDTO[] = response.data;
      setFoods(foodData);
    }
    
    loadData();
  }, []);

  async function handleAddFood(food: Omit<FoodDTO, 'id'>): Promise<void> {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
      const newFood: FoodDTO = response.data;
      setFoods([...foods, newFood]);
    }catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodDTO): Promise<void> {
    try {
      const response = await api.put(
          `/foods/${editingFood.id}`,
          { ...editingFood, ...food },
        );
      const foodUpdated: FoodDTO = response.data;
      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.id ? f : foodUpdated);
      setFoods(foodsUpdated);
    }catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`/foods/${id}`);
      const foodsFiltered = foods.filter(f => f.id !== id);
      setFoods(foodsFiltered);
    }catch (err) {
      console.log(err);
    }
  }

  function toggleModal (): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodDTO): void {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
      <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={modalOpen}
          setIsOpen={toggleModal}
          handleAddFood={handleAddFood}
        />
        <ModalEditFood
          isOpen={editModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={handleDeleteFood}
                handleEditFood={handleEditFood}
              />
            ))}
        </FoodsContainer>
      </>
    );

};

export default Dashboard;
