import { Payer } from "@/types/payer";

interface PayerListProps {
  payers: Payer[];
  selectedPayerId?: string;
  onSelect: (payer: Payer) => void;
}

export const PayerList = ({ payers, selectedPayerId, onSelect }: PayerListProps) => {
  if (payers.length === 0) {
    return null;
  }

  return (
    <div className="absolute mt-2 w-full border rounded-md divide-y bg-white shadow-lg z-10">
      {payers.map((payer) => (
        <button
          key={payer.id}
          onClick={() => onSelect(payer)}
          className={`w-full px-4 py-2 text-left hover:bg-accent ${
            selectedPayerId === payer.id ? 'bg-accent' : ''
          }`}
        >
          {payer.name}
        </button>
      ))}
    </div>
  );
};