import { useState } from "react";
import { MeasureFormModal } from "@/components/Measure/MeasureFormModal";
import { MeasureGraph } from "@/components/Measure/MeasureGraph";
import { MeasureTable } from "@/components/Measure/MeasureTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { MeasurePageSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateMeasure,
  useDeleteMeasure,
  useMeasures,
  useUpdateMeasure,
} from "@/hooks/use-measures";
import type { CreateMeasureInput, Measure } from "@/types/measures";

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
    <PageShell>
      <PageHeader
        title="Mensurations"
        align="center"
        actionsAlign="between"
        actions={
          <>
            <Button
              variant="outline"
              pill
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Sortir du mode édition" : "Mode édition"}
            </Button>

            {isEditMode && (
              <Button
                variant="outline"
                pill
                size="sm"
                onClick={() => {
                  setSelectedMeasure(undefined);
                  setIsModalVisible(true);
                }}
              >
                Ajouter une mensuration
              </Button>
            )}
          </>
        }
      />

      {isLoading ? (
        <MeasurePageSkeleton />
      ) : measures.length === 0 ? (
        <EmptyState>Aucune mensuration pour le moment</EmptyState>
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
    </PageShell>
  );
}
