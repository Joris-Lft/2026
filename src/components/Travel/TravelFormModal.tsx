import { useEffect, useState } from "react";
import type { TravelFormInput } from "@/types/travels";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { uploadImageFile } from "@/utils/upload-image";
import styles from "./TravelFormModal.module.css";

interface TravelFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (value: TravelFormInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

type PendingCover = {
  file: File;
  previewUrl: string;
};

function TravelFormModalContent({
  onClose,
  onSubmit,
  isSubmitting = false,
}: Omit<TravelFormModalProps, "isVisible">) {
  const [name, setName] = useState("");
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
  };

  const handleClose = () => {
    if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Veuillez saisir un nom de voyage");
      return;
    }

    try {
      setError(null);
      const coverUrl = pendingCover
        ? await uploadImageFile(pendingCover.file)
        : null;

      await onSubmit({ name: name.trim(), coverUrl });

      if (pendingCover) URL.revokeObjectURL(pendingCover.previewUrl);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible de créer le voyage",
      );
    }
  };

  return (
    <Modal
      open
      portal
      onClose={handleClose}
      title="Nouveau voyage"
      titleId="travel-modal-title"
      footer={
        <ModalActions
          submitLabel={isSubmitting ? "Création..." : "Créer"}
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
          placeholder="Ex. Week-end à Rome"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
        />
      </FormField>

      <FormField label="Photo" hint="Optionnelle — JPG, PNG, GIF, WebP…">
        {pendingCover ? (
          <div className={styles.coverPreview}>
            <img
              src={pendingCover.previewUrl}
              alt=""
              className={styles.coverImage}
            />
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
    </Modal>
  );
}

export function TravelFormModal({
  isVisible,
  ...props
}: TravelFormModalProps) {
  if (!isVisible) return null;
  return <TravelFormModalContent {...props} />;
}
