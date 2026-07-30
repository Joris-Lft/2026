import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SavingsCard } from "@/components/Travel/SavingsCard";
import { TravelCard } from "@/components/Travel/TravelCard";
import { TravelFormModal } from "@/components/Travel/TravelFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { PageLoadingSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useTravelBudgetTotals } from "@/hooks/use-travel-budget";
import { emptyBudgetTotals } from "@/types/travel-budget";
import { useDeposits } from "@/hooks/use-travel-savings";
import { useCreateTravel, useTravels } from "@/hooks/use-travels";
import type { Travel, TravelFormInput } from "@/types/travels";
import styles from "./VoyagesPage.module.css";

export function VoyagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: travels = [], isLoading, isError } = useTravels(user?.email);
  const createTravelMutation = useCreateTravel(user?.email);
  const { data: budgetTotals = {} } = useTravelBudgetTotals();
  const { data: deposits = [] } = useDeposits();

  const savings = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits],
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEmpty = !isLoading && !isError && travels.length === 0;

  const openCreateModal = () => {
    setFormError(null);
    setIsModalVisible(true);
  };

  const closeModal = () => setIsModalVisible(false);

  const handleOpenTravel = (travel: Travel) => {
    void navigate(`/voyages/${travel.id}`);
  };

  const handleSubmit = async (value: TravelFormInput) => {
    setFormError(null);
    try {
      const travel = await createTravelMutation.mutateAsync(value);
      closeModal();
      void navigate(`/voyages/${travel.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Enregistrement impossible";
      setFormError(message);
      throw error;
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Voyages"
        align="center"
        actions={
          <Button pill onClick={openCreateModal}>
            Nouveau voyage
          </Button>
        }
      />

      {formError && <p className={styles.errorBanner}>{formError}</p>}

      <div className={styles.savings}>
        <SavingsCard />
      </div>

      {isLoading ? (
        <PageLoadingSkeleton />
      ) : isError ? (
        <EmptyState>Impossible de charger les voyages</EmptyState>
      ) : isEmpty ? (
        <EmptyState>Aucun voyage pour le moment</EmptyState>
      ) : (
        <div className={styles.grid}>
          {travels.map((travel) => (
            <TravelCard
              key={travel.id}
              travel={travel}
              budget={{
                totals: budgetTotals[travel.id] ?? emptyBudgetTotals(),
                saved: savings,
              }}
              onOpen={handleOpenTravel}
            />
          ))}
        </div>
      )}

      <TravelFormModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={createTravelMutation.isPending}
      />
    </PageShell>
  );
}
