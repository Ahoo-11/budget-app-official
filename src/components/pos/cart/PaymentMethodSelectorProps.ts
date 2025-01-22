export interface PaymentMethodSelectorProps {
  method: 'cash' | 'transfer';
  onMethodChange: (method: 'cash' | 'transfer') => void;
}