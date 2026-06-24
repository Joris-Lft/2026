import { useState } from "react";
import type {
  CreateMeasureInput,
  Measure,
  UpdateMeasureInput,
} from "@/types/measures";
import styles from "./MeasureFormModal.module.css";

interface MeasureFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (value: CreateMeasureInput) => void;
  initialMeasure?: Measure;
  onUpdate?: (value: UpdateMeasureInput) => void;
}

type FormState = {
  thigh: string;
  arm: string;
  chest: string;
  waist: string;
  hip: string;
  weight: string;
};

const INITIAL_FORM_STATE: FormState = {
  thigh: "",
  arm: "",
  chest: "",
  waist: "",
  hip: "",
  weight: "",
};

const FORM_FIELDS: { key: keyof FormState; placeholder: string }[] = [
  { key: "thigh", placeholder: "Cuisse (cm)" },
  { key: "arm", placeholder: "Bras (cm)" },
  { key: "chest", placeholder: "Poitrine (cm)" },
  { key: "waist", placeholder: "Taille (cm)" },
  { key: "hip", placeholder: "Hanche (cm)" },
  { key: "weight", placeholder: "Poids (kg)" },
];

function measureToFormState(measure: Measure): FormState {
  return {
    thigh: String(measure.thigh),
    arm: String(measure.arm),
    chest: String(measure.bust),
    waist: String(measure.waist),
    hip: String(measure.hip),
    weight: String(measure.weight),
  };
}

function MeasureFormModalContent({
  onClose,
  onCreate,
  initialMeasure,
  onUpdate,
}: Omit<MeasureFormModalProps, "isVisible">) {
  const isEditing = !!initialMeasure;
  const [form, setForm] = useState<FormState>(() =>
    initialMeasure ? measureToFormState(initialMeasure) : INITIAL_FORM_STATE,
  );

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    setForm(INITIAL_FORM_STATE);
    onClose();
  };

  const handleSubmit = () => {
    const fields: CreateMeasureInput = {
      thigh: parseFloat(form.thigh) || 0,
      arm: parseFloat(form.arm) || 0,
      bust: parseFloat(form.chest) || 0,
      waist: parseFloat(form.waist) || 0,
      hip: parseFloat(form.hip) || 0,
      weight: parseFloat(form.weight) || 0,
    };

    if (isEditing && onUpdate && initialMeasure) {
      onUpdate({ ...fields, id: initialMeasure.id, date: initialMeasure.date });
    } else {
      onCreate(fields);
    }

    setForm(INITIAL_FORM_STATE);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose} role="presentation">
      <dialog
        open
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="measure-form-title"
      >
        <div className={styles.header}>
          <h2 id="measure-form-title" className={styles.modalTitle}>
            {isEditing ? "Modifier les mensurations" : "Ajouter des mensurations"}
          </h2>
          <button type="button" className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.form}>
          {FORM_FIELDS.map(({ key, placeholder }) => (
            <input
              key={key}
              className={styles.input}
              type="number"
              inputMode="decimal"
              step="any"
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelLink} onClick={handleClose}>
            Annuler
          </button>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            {isEditing ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function MeasureFormModal({
  isVisible,
  initialMeasure,
  ...props
}: MeasureFormModalProps) {
  if (!isVisible) return null;

  return (
    <MeasureFormModalContent
      key={initialMeasure?.id ?? "new"}
      initialMeasure={initialMeasure}
      {...props}
    />
  );
}
