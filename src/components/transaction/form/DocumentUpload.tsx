import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentUploadProps {
  documentUrl?: string;
  onDocumentUpload?: (file: File) => Promise<void>;
  isSubmitting: boolean;
}

export const DocumentUpload = ({
  documentUrl,
  onDocumentUpload,
  isSubmitting
}: DocumentUploadProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDocumentUpload) {
      await onDocumentUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Supporting Document</Label>
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isSubmitting}
        accept="image/*,.pdf"
      />
      {documentUrl && (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline mt-2 block"
        >
          View current document
        </a>
      )}
    </div>
  );
};