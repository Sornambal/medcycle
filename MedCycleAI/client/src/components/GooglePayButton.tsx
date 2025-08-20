import React from 'react';

interface GooglePayButtonProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const handleClick = () => {
    // Simulate a successful payment
    setTimeout(() => {
      onPaymentSuccess('dummy-transaction-id');
    }, 1000);
  };

  return (
    <button onClick={handleClick} className="bg-blue-500 text-white p-2 rounded">
      Pay with Google Pay - ₹{amount}
    </button>
  );
};

export default GooglePayButton;
