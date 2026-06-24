import { useState } from "react";
import { MeasureFormModal } from "@/components/Measure/MeasureFormModal";
import { MeasureGraph } from "@/components/Measure/MeasureGraph";
import { MeasureTable } from "@/components/Measure/MeasureTable";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateMeasure,
  useDeleteMeasure,
  useMeasures,
  useUpdateMeasure,
} from "@/hooks/use-measures";
import type { CreateMeasureInput, Measure } from "@/types/measures";
import styles from "./MeasurePage.module.css";

const todayDate = new Date().toISOString().split("T")[0];

export function MeasurePage() {
  const { user } = useAuth();
  const { data: measures = [], isLoading } = useMeasures(user?.email);
  const createMeasureMutation = useCreateMeasure(user?.id);
  const updateMeasureMutation = useUpdateMeasure();
  const deleteMeasureMutation = useDeleteMeasure();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState<Measure | undefined>();

  const addMeasure = async (value: CreateMeasureInput) => {
    if (!user?.id) return;
    try {
      await createMeasureMutation.mutateAsync({ data: value, date: todayDate });
    } catch (error) {
      console.error("Erreur lors de la création de la mensuration:", error);
    }
    setIsModalVisible(false);
  };

  const handleEdit = (measure: Measure) => {
    setSelectedMeasure(measure);
    setIsModalVisible(true);
  };

  const handleUpdate = async (value: Measure) => {
    try {
      await updateMeasureMutation.mutateAsync(value);
    } catch (error) {
      console.error("Erreur lors de la modification de la mensuration:", error);
    }
    setSelectedMeasure(undefined);
    setIsModalVisible(false);
  };

  const handleDelete = async (measure: Measure) => {
    try {
      await deleteMeasureMutation.mutateAsync(measure.id);
    } catch (error) {
      console.error("Erreur lors de la suppression de la mensuration:", error);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mensurations</h1>

      <div className={styles.headerButtons}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? "Sortir du mode édition" : "Mode édition"}
        </button>

        {isEditMode && (
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setSelectedMeasure(undefined);
              setIsModalVisible(true);
            }}
          >
            + Ajouter une mensuration
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} aria-label="Chargement" />
          <p className={styles.loadingText}>Chargement des mensurations...</p>
        </div>
      ) : measures.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>Aucune mensuration pour le moment</p>
        </div>
      ) : (
        <div>
          <MeasureTable
            measures={measures}
            isEditMode={isEditMode}
            onEdit={handleEdit}
            onDelete={(measure) => void handleDelete(measure)}
          />
          <MeasureGraph measurements={measures} />
        </div>
      )}

      {isModalVisible && (
        <MeasureFormModal
          isVisible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedMeasure(undefined);
          }}
          onCreate={addMeasure}
          initialMeasure={selectedMeasure}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
