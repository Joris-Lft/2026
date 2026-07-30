import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { ActivitiesSection } from "@/components/Travel/ActivitiesSection";
import { BudgetProgress } from "@/components/Travel/BudgetProgress";
import { BudgetSection } from "@/components/Travel/BudgetSection";
import { TravelEditModal } from "@/components/Travel/TravelEditModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/ui/PageShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageLoadingSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useTravelBudget } from "@/hooks/use-travel-budget";
import { useDeposits } from "@/hooks/use-travel-savings";
import { useTravel, useUpdateTravel } from "@/hooks/use-travels";
import { sumBudgetTotals } from "@/types/travel-budget";
import type { TravelDetailsInput } from "@/types/travels";
import styles from "./VoyageDetailPage.module.css";

type TravelTab = "apercu" | "budget" | "activites";

const TRAVEL_TABS: { value: TravelTab; label: string }[] = [
  { value: "apercu", label: "Aperçu" },
  { value: "budget", label: "Budget" },
  { value: "activites", label: "Activités" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string): string | null {
  if (start && end) return `${formatDate(start)} → ${formatDate(end)}`;
  if (start) return `À partir du ${formatDate(start)}`;
  if (end) return `Jusqu'au ${formatDate(end)}`;
  return null;
}

export function VoyageDetailPage() {
  const { travelId } = useParams<{ travelId: string }>();
  const { user } = useAuth();
  const { data: travel, isLoading, isError } = useTravel(travelId);
  const updateTravelMutation = useUpdateTravel(user?.email);
  const { data: budgetLines = [] } = useTravelBudget(travelId);
  const { data: deposits = [] } = useDeposits();

  const budgetTotals = useMemo(
    () => sumBudgetTotals(budgetLines),
    [budgetLines],
  );
  const savings = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits],
  );

  const [isEditVisible, setIsEditVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TravelTab>("apercu");
  const [mapFocusId, setMapFocusId] = useState<string | undefined>();

  const handleSubmit = async (value: TravelDetailsInput) => {
    if (!travel) return;
    await updateTravelMutation.mutateAsync({ ...value, id: travel.id });
    setIsEditVisible(false);
  };

  const dateRange = travel ? formatDateRange(travel.startDate, travel.endDate) : null;
  const hasInfos = travel && (travel.destination || dateRange || travel.description);

  return (
    <PageShell>
      <Link to="/voyages" className={styles.back}>
        <ArrowLeft size={18} />
        <span>Voyages</span>
      </Link>

      {isLoading ? (
        <PageLoadingSkeleton />
      ) : isError || !travel ? (
        <EmptyState>Voyage introuvable</EmptyState>
      ) : (
        <div className={styles.content}>
          <div className={styles.cover}>
            {travel.coverUrl ? (
              <img src={travel.coverUrl} alt="" className={styles.coverImage} />
            ) : (
              <div className={styles.coverFallback} aria-hidden>
                <MapPin size={36} />
              </div>
            )}
            <Button
              className={styles.editButton}
              variant="secondary"
              size="sm"
              pill
              onClick={() => setIsEditVisible(true)}
            >
              <Pencil size={15} />
              Modifier
            </Button>
          </div>

          <h1 className={styles.title}>{travel.name}</h1>

          {(travel.destination || dateRange) && (
            <div className={styles.metaRow}>
              {travel.destination && (
                <span className={styles.metaItem}>
                  <MapPin size={16} />
                  {travel.destination}
                </span>
              )}
              {dateRange && (
                <span className={styles.metaItem}>
                  <CalendarDays size={16} />
                  {dateRange}
                </span>
              )}
            </div>
          )}

          <div className={styles.tabs}>
            <SegmentedControl
              value={activeTab}
              options={TRAVEL_TABS}
              onChange={setActiveTab}
              ariaLabel="Sections du voyage"
            />
          </div>

          {activeTab === "apercu" ? (
            <div className={styles.overview}>
              {budgetTotals.total > 0 && (
                <Card padded>
                  <h2 className={styles.sectionTitle}>Budget prévisionnel</h2>
                  <BudgetProgress totals={budgetTotals} saved={savings} />
                </Card>
              )}
              {travel.description ? (
                <Card padded>
                  <Markdown>{travel.description}</Markdown>
                </Card>
              ) : !hasInfos ? (
                <EmptyState>
                  Ajoute une destination, des dates et une description avec
                  « Modifier ».
                </EmptyState>
              ) : null}
            </div>
          ) : activeTab === "budget" ? (
            <BudgetSection
              travelId={travel.id}
              onShowOnMap={(line) => {
                setMapFocusId(line.id);
                setActiveTab("activites");
              }}
            />
          ) : (
            <ActivitiesSection travelId={travel.id} focusId={mapFocusId} />
          )}
        </div>
      )}

      {travel && (
        <TravelEditModal
          isVisible={isEditVisible}
          travel={travel}
          onClose={() => setIsEditVisible(false)}
          onSubmit={handleSubmit}
          isSubmitting={updateTravelMutation.isPending}
        />
      )}
    </PageShell>
  );
}
