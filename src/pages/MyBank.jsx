import React from 'react';
import { useNavigate } from 'react-router-dom';
import FakeBankInterface from '../components/banking/FakeBankInterface';

export default function MyBank() {
  const navigate = useNavigate();

  return (
    <FakeBankInterface onClose={() => navigate(-1)} />
  );
}