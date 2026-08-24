import { useMemo, useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import { TagFilter } from "@/components/Tag/Tag";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Markdown } from "@/components/ui/Markdown";
import { PageLoadingSkeleton } from "@/components/ui/Skeleton";
import {
  useCreateBudgetLine,
  useDeleteBudgetLine,
  useTravelBudget,
  useUpdateBudgetLine,
} from "@/hooks/use-travel-budget";
import {
  BUDGET_CATEGORIES,
  isVisitItem,
  type BudgetLine,
  type BudgetLineInput,
} from "@/types/travel-budget";
import { formatCurrency } from "@/utils/format";
import { buildMapsUrl } from "@/utils/maps";
import { ActivitiesMap } from "./ActivitiesMap";
import { BudgetLineModal } from "./BudgetLineModal";
import budgetStyles from "./BudgetSection.module.css";
import styles from "./ActivitiesSection.module.css";

export function ActivitiesSection({
  travelId,
  focusId,
}: {
  travelId: string;
  focusId?: string;
}) {
  const { data: lines = [], isLoading, isError } = useTravelBudget(travelId);
  const createLine = useCreateBudgetLine(travelId);
  const updateLine = useUpdateBudgetLine(travelId);
  const deleteLine = useDeleteBudgetLine(travelId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BudgetLine | undefined>();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const visitLines = useMemo(() => lines.filter(isVisitItem), [lines]);

  const visibleLines = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = visitLines.filter((l) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(l.category);
      const matchesSearch =
        query === "" || l.label.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const byCategory =
        BUDGET_CATEGORIES.indexOf(a.category) -
        BUDGET_CATEGORIES.indexOf(b.category);
      if (byCategory !== 0) return byCategory;
      return a.label.localeCompare(b.label, "fr");
    });
  }, [visitLines, selectedCategories, search]);

  const openCreate = () => {
    setSelectedLine(undefined);
    setIsModalVisible(true);
  };

  const openEdit = (line: BudgetLine) => {
    setSelectedLine(line);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedLine(undefined);
  };

  const handleSubmit = async (value: BudgetLineInput) => {
    if (selectedLine) {
      await updateLine.mutateAsync({ ...value, id: selectedLine.id });
    } else {
      await createLine.mutateAsync(value);
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (!selectedLine) return;
    await deleteLine.mutateAsync(selectedLine.id);
    closeModal();
  };

  if (isLoading) return <PageLoadingSkeleton />;
  if (isError) return <EmptyState>Impossible de charger les activités</EmptyState>;

  return (
    <div className={styles.section}>
      <ActivitiesMap lines={visitLines} focusId={focusId} />

      <div className={budgetStyles.addRow}>
        <Button pill size="sm" onClick={openCreate}>
          <Plus size={16} />
          Ajouter une activité
        </Button>
      </div>

      {visitLines.length === 0 ? (
        <EmptyState>Aucune activité à visiter pour le moment</EmptyState>
      ) : (
        <>
          <div className={budgetStyles.controls}>
            <div className={budgetStyles.searchField}>
              <Search
                size={16}
                className={budgetStyles.searchIcon}
                aria-hidden
              />
              <Input
                className={budgetStyles.searchInput}
                type="search"
                placeholder="Rechercher une activité..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Rechercher une activité par nom"
              />
            </div>
            <TagFilter
              tags={[...BUDGET_CATEGORIES]}
              selectedTags={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          {visibleLines.length === 0 ? (
            <EmptyState>Aucune activité ne correspond à la recherche</EmptyState>
          ) : (
            <ul className={budgetStyles.lineList}>
              {visibleLines.map((line) => (
                <li key={line.id} className={budgetStyles.lineRow}>
                  <button
                    type="button"
                    className={budgetStyles.lineBody}
                    onClick={() => openEdit(line)}
                  >
                    <span className={budgetStyles.lineMain}>
                      <span className={budgetStyles.lineHead}>
                        <span className={budgetStyles.badge}>
                          {line.category}
                        </span>
                        <span className={budgetStyles.lineLabel}>
                          {line.label}
                        </span>
                      </span>
                      {line.notes && (
                        <Markdown compact className={budgetStyles.lineNotes}>
                          {line.notes}
                        </Markdown>
                      )}
                    </span>
                    {line.estimated != null && (
                      <span className={budgetStyles.lineAmounts}>
                        <span className={budgetStyles.lineEstimated}>
                          {formatCurrency(line.estimated)}
                        </span>
                      </span>
                    )}
                  </button>
                  {line.location && (
                    <a
                      className={budgetStyles.lineMap}
                      href={buildMapsUrl(line.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ouvrir dans Google Maps"
                    >
                      <MapPin size={18} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <BudgetLineModal
        isVisible={isModalVisible}
        initialLine={selectedLine}
        createDefaults={{ inBudget: false, toVisit: true }}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={selectedLine ? handleDelete : undefined}
        isSubmitting={createLine.isPending || updateLine.isPending}
        isDeleting={deleteLine.isPending}
      />
    </div>
  );
}
