import { useEffect, useState } from "react";
import type { Travel, TravelDetailsInput } from "@/types/travels";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { uploadImageFile } from "@/utils/upload-image";
import styles from "./TravelFormModal.module.css";

interface TravelEditModalProps {
  isVisible: boolean;
  travel: Travel;
  onClose: () => void;
  onSubmit: (value: TravelDetailsInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

type PendingCover = {
  file: File;
  previewUrl: string;
};

function TravelEditModalContent({
  travel,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Omit<TravelEditModalProps, "isVisible">) {
  const [name, setName] = useState(travel.name);
  const [destination, setDestination] = useState(travel.destination);
  const [startDate, setStartDate] = useState(travel.startDate);
  const [endDate, setEndDate] = useState(travel.endDate);
  const [description, setDescription] = useState(travel.description);
  const [keptCoverUrl, setKeptCoverUrl] = useState<string | null>(
    travel.coverUrl,
  );
  const [pendingCover, setPendingCover] = useState<PendingCover | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
    };
  }, [pendingCover]);

  const handleCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = Array.from(event.target.files ?? []).find((f) =>
      f.type.startsWith("image/"),
    );
    event.target.value = "";
    if (!file) return;

    setPendingCover((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  };

  const removeCover = () => {
    setPendingCover((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setKeptCoverUrl(null);
  };

  const handleClose = () => {
    if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
    onClose();
  };

  const currentPreview = pendingCover?.previewUrl ?? keptCoverUrl;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Veuillez saisir un nom de voyage");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError("La date de fin doit être après la date de début");
      return;
    }

    try {
      setError(null);
      const coverUrl = pendingCover
        ? await uploadImageFile(pendingCover.file)
        : keptCoverUrl;

      await onSubmit({
        name: name.trim(),
        coverUrl,
        destination: destination.trim(),
        startDate,
        endDate,
        description: description.trim(),
      });

      if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer le voyage",
      );
    }
  };

  return (
    <Modal
      open
      portal
      variant="drawer"
      onClose={handleClose}
      title="Modifier le voyage"
      titleId="travel-edit-title"
      footer={
        <ModalActions
          submitLabel={isSubmitting ? "Enregistrement..." : "Enregistrer"}
          onCancel={handleClose}
          onSubmit={() => void handleSubmit()}
          loading={isSubmitting}
          submitDisabled={isSubmitting}
        />
      }
    >
      <FormField label="Nom du voyage" htmlFor="travel-name" error={error}>
        <Input
          id="travel-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
        />
      </FormField>

      <FormField label="Photo">
        {currentPreview ? (
          <div className={styles.coverPreview}>
            <img src={currentPreview} alt="" className={styles.coverImage} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={removeCover}
              aria-label="Retirer la photo"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        ) : (
          <label className={styles.fileInputLabel}>
            Choisir une photo
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleCoverSelect}
              disabled={isSubmitting}
            />
          </label>
        )}
      </FormField>

      <FormField label="Destination" htmlFor="travel-destination">
        <Input
          id="travel-destination"
          placeholder="Ex. Kyoto, Japon"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </FormField>

      <div className={styles.dateRow}>
        <FormField label="Date de début" htmlFor="travel-start">
          <Input
            id="travel-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormField>
        <FormField label="Date de fin" htmlFor="travel-end">
          <Input
            id="travel-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormField>
      </div>

      <FormField
        label="Description"
        htmlFor="travel-description"
        hint="Markdown supporté (titres, listes…)"
      >
        <Textarea
          id="travel-description"
          placeholder="Notes, idées, programme..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </FormField>
    </Modal>
  );
}

export function TravelEditModal({
  isVisible,
  travel,
  ...props
}: TravelEditModalProps) {
  if (!isVisible) return null;
  return <TravelEditModalContent key={travel.id} travel={travel} {...props} />;
}
