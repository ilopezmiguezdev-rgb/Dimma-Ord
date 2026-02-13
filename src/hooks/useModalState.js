import { useState } from 'react';

const useModalState = () => {
  const [formModal, setFormModal] = useState({ isOpen: false });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false });
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleAddNewOrder = () => {
    setCurrentOrder(null);
    setFormModal({ isOpen: true });
  };

  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    setFormModal({ isOpen: true });
  };

  const handleViewDetails = (order) => {
    setCurrentOrder(order);
    setDetailsModal({ isOpen: true });
  };

  const closeAllModals = () => {
    setFormModal({ isOpen: false });
    setDetailsModal({ isOpen: false });
    setCurrentOrder(null);
  };

  return {
    formModal,
    detailsModal,
    currentOrder,
    handleAddNewOrder,
    handleEditOrder,
    handleViewDetails,
    closeAllModals,
  };
};

export default useModalState;