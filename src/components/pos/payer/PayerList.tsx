import { Payer } from "@/types/payer";

interface PayerListProps {
  payers: Payer[];
  selectedPayerId?: string;
  onSelect: (payer: Payer) => void;
}

export const PayerList = ({ payers, selectedPayerId, onSelect }: PayerListProps) => {
  if (payers.length === 0) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
      {payers.map(payer => (
        <button
          key={payer.id}
          onClick={() => onSelect(payer)}
          className={`w-full px-4 py-2 text-left hover:bg-accent transition-colors ${
            selectedPayerId === payer.id ? 'bg-accent' : ''
          }`}
        >
          <div className="font-medium">{payer.name}</div>
        </button>
      ))}
    </div>
  );
};