"use client";

interface QualificationInputProps {
  index: number;
  qualification: {
    name: string;
    institution: string;
    dateObtained: string | null;
  };
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

export default function QualificationInput({
  index,
  qualification,
  onChange,
  onRemove
}: QualificationInputProps) {
  return (
    <div className="border rounded p-4 mb-4 bg-gray-50">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualification Name
        </label>
        <input
          type="text"
          value={qualification.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institution
        </label>
        <input
          type="text"
          value={qualification.institution}
          onChange={(e) => onChange(index, "institution", e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date Obtained
        </label>
        <input
          type="date"
          value={qualification.dateObtained ? qualification.dateObtained.split("T")[0] : ""}
          onChange={(e) =>
            onChange(index, "dateObtained", e.target.value ? new Date(e.target.value).toISOString() : "")
          }
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-500 text-sm hover:underline"
      >
        Remove Qualification
      </button>
    </div>
  );
}
