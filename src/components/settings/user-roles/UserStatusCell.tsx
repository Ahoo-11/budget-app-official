import { User } from "@/types/roles";

export function UserStatusCell({ status }: { status?: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${
      status === 'approved' ? 'bg-green-100 text-green-800' :
      status === 'rejected' ? 'bg-red-100 text-red-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      {status || 'Unknown'}
    </span>
  );
}