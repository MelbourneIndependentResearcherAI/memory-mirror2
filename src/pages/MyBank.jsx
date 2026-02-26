import React from 'react';
import { useNavigate } from 'react-router-dom';
import FakeBankInterface from '../components/banking/FakeBankInterface';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function MyBank() {
  const navigate = useNavigate();

  return (
    <>
      <FakeBankInterface onClose={() => navigate(-1)} />
      <PageLoadTip pageName="MyBank" />
    </>
  );
}