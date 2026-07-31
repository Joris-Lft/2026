import { useEffect, useState } from "react";
import type { Travel, TravelDetailsInput } from "@/types/travels";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { uploadImageFile } from "@/utils/upload-image";
import styles from "./TravelFormModal.module.css";

interface TravelFormModalProps {
  isVisible: boolean;
  /** Projet à éditer ; absent = création d'un nouveau projet. */
  travel?: Travel;
  onClose: () => void;
  onSubmit: (value: TravelDetailsInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

type PendingCover = {
  file: File;
  previewUrl: string;
};

function TravelFormModalContent({
  travel,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Omit<TravelFormModalProps, "isVisible">) {
  const isEditing = Boolean(travel);
  const [name, setName] = useState(travel?.name ?? "");
  const [isVoyage, setIsVoyage] = useState(travel?.isVoyage ?? false);
  const [destination, setDestination] = useState(travel?.destination ?? "");
  const [startDate, setStartDate] = useState(travel?.startDate ?? "");
  const [endDate, setEndDate] = useState(travel?.endDate ?? "");
  const [description, setDescription] = useState(travel?.description ?? "");
  const [keptCoverUrl, setKeptCoverUrl] = useState<string | null>(
    travel?.coverUrl ?? null,
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
      setError("Veuillez saisir un nom de projet");
      return;
    }
    if (isVoyage && startDate && endDate && endDate < startDate) {
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
        isVoyage,
        destination: isVoyage ? destination.trim() : "",
        startDate: isVoyage ? startDate : "",
        endDate: isVoyage ? endDate : "",
        description: description.trim(),
      });

      if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer le projet",
      );
    }
  };

  const submitLabel = isSubmitting
    ? isEditing
      ? "Enregistrement..."
      : "Création..."
    : isEditing
      ? "Enregistrer"
      : "Créer";

  return (
    <Modal
      open
      portal
      variant="drawer"
      onClose={handleClose}
      title={isEditing ? "Modifier le projet" : "Nouveau projet"}
      titleId="travel-form-title"
      footer={
        <ModalActions
          submitLabel={submitLabel}
          onCancel={handleClose}
          onSubmit={() => void handleSubmit()}
          loading={isSubmitting}
          submitDisabled={isSubmitting}
        />
      }
    >
      <FormField label="Nom du projet" htmlFor="travel-name" error={error}>
        <Input
          id="travel-name"
          placeholder="Ex. Week-end à Rome"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          autoFocus={!isEditing}
        />
      </FormField>

      <FormField label="Photo" hint="Optionnelle — JPG, PNG, GIF, WebP…">
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

      <Checkbox
        checked={isVoyage}
        onChange={setIsVoyage}
        label="Ce projet est un voyage"
        hint="Ajoute une destination, des dates et une carte des lieux."
      />

      {isVoyage && (
        <>
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
        </>
      )}

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

export function TravelFormModal({
  isVisible,
  travel,
  ...props
}: TravelFormModalProps) {
  if (!isVisible) return null;
  return (
    <TravelFormModalContent key={travel?.id ?? "new"} travel={travel} {...props} />
  );
}
