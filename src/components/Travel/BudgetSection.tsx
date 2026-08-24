import { useMemo, useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import { TagFilter } from "@/components/Tag/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Markdown } from "@/components/ui/Markdown";
import { PageLoadingSkeleton } from "@/components/ui/Skeleton";
import {
  useBudgetCategoryOptions,
  useCreateBudgetLine,
  useDeleteBudgetLine,
  useTravelBudget,
  useUpdateBudgetLine,
} from "@/hooks/use-travel-budget";
import {
  compareBudgetCategories,
  isBudgetItem,
  sumPurchasedSpend,
  type BudgetLine,
  type BudgetLineInput,
  type SpendLevel,
} from "@/types/travel-budget";
import { formatCurrency } from "@/utils/format";
import { mergeOptions } from "@/utils/options";
import { BudgetLineModal } from "./BudgetLineModal";
import styles from "./BudgetSection.module.css";

function levelClassName(level: SpendLevel): string {
  if (level === "Strict minimum") return styles.levelMin;
  if (level === "Royal") return styles.levelRoyal;
  return styles.levelComfort;
}

export function BudgetSection({
  travelId,
  onShowOnMap,
}: {
  travelId: string;
  onShowOnMap?: (line: BudgetLine) => void;
}) {
  const { data: lines = [], isLoading, isError } = useTravelBudget(travelId);
  const { options: categoryOptions } = useBudgetCategoryOptions(lines);
  const createLine = useCreateBudgetLine(travelId);
  const updateLine = useUpdateBudgetLine(travelId);
  const deleteLine = useDeleteBudgetLine(travelId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BudgetLine | undefined>();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const budgetLines = useMemo(() => lines.filter(isBudgetItem), [lines]);

  // Le filtre ne propose que les catégories réellement présentes ici, alors que la
  // modale propose toutes celles de la base.
  const filterCategories = useMemo(
    () =>
      mergeOptions(budgetLines.map((l) => l.category)).sort(
        compareBudgetCategories,
      ),
    [budgetLines],
  );

  const totals = useMemo(() => {
    const remaining = budgetLines
      .filter((l) => !l.purchased)
      .reduce((sum, l) => sum + (l.estimated ?? 0), 0);
    const paid = sumPurchasedSpend(budgetLines);
    const minimum = budgetLines
      .filter((l) => !l.purchased && l.spendLevel === "Strict minimum")
      .reduce((sum, l) => sum + (l.estimated ?? 0), 0);
    return { remaining, paid, minimum };
  }, [budgetLines]);

  const visibleLines = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = budgetLines.filter((l) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (category) => category.toLowerCase() === l.category.toLowerCase(),
        );
      const matchesSearch =
        query === "" || l.label.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const byCategory = compareBudgetCategories(a.category, b.category);
      if (byCategory !== 0) return byCategory;
      return a.label.localeCompare(b.label, "fr");
    });
  }, [budgetLines, selectedCategories, search]);

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
  if (isError) return <EmptyState>Impossible de charger le budget</EmptyState>;

  return (
    <div className={styles.section}>
      <Card padded className={styles.summary}>
        <div className={styles.totals}>
          <div className={styles.total}>
            <span className={styles.totalLabel}>Reste à payer</span>
            <span className={styles.totalValue}>
              {formatCurrency(totals.remaining)}
            </span>
          </div>
          {totals.paid > 0 && (
            <div className={styles.total}>
              <span className={styles.totalLabel}>Déjà payé</span>
              <span className={styles.totalValue}>
                {formatCurrency(totals.paid)}
              </span>
            </div>
          )}
        </div>
        {totals.minimum > 0 && (
          <p className={styles.minimumLine}>
            dont strict minimum (obligatoire) :{" "}
            <strong>{formatCurrency(totals.minimum)}</strong>
          </p>
        )}
      </Card>

      <div className={styles.addRow}>
        <Button pill size="sm" onClick={openCreate}>
          <Plus size={16} />
          Ajouter au budget
        </Button>
      </div>

      {budgetLines.length === 0 ? (
        <EmptyState>Aucune ligne de budget pour le moment</EmptyState>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.searchField}>
              <Search size={16} className={styles.searchIcon} aria-hidden />
              <Input
                className={styles.searchInput}
                type="search"
                placeholder="Rechercher dans le budget..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Rechercher une ligne de budget par nom"
              />
            </div>
            <TagFilter
              tags={filterCategories}
              selectedTags={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          {visibleLines.length === 0 ? (
            <EmptyState>Aucune ligne ne correspond à la recherche</EmptyState>
          ) : (
            <ul className={styles.lineList}>
              {visibleLines.map((line) => (
                <BudgetLineRow
                  key={line.id}
                  line={line}
                  onEdit={openEdit}
                  onShowOnMap={onShowOnMap}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <BudgetLineModal
        isVisible={isModalVisible}
        initialLine={selectedLine}
        categoryOptions={categoryOptions}
        createDefaults={{ inBudget: true, toVisit: false }}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={selectedLine ? handleDelete : undefined}
        isSubmitting={createLine.isPending || updateLine.isPending}
        isDeleting={deleteLine.isPending}
      />
    </div>
  );
}

function BudgetLineRow({
  line,
  onEdit,
  onShowOnMap,
}: {
  line: BudgetLine;
  onEdit: (line: BudgetLine) => void;
  onShowOnMap?: (line: BudgetLine) => void;
}) {
  return (
    <li className={styles.lineRow}>
      <button
        type="button"
        className={styles.lineBody}
        onClick={() => onEdit(line)}
      >
        <span className={styles.lineMain}>
          <span className={styles.lineHead}>
            <span className={styles.badge}>{line.category}</span>
            <span className={`${styles.levelBadge} ${levelClassName(line.spendLevel)}`}>
              {line.spendLevel}
            </span>
            {line.purchased && (
              <span className={styles.purchasedBadge}>Acheté</span>
            )}
            <span className={styles.lineLabel}>{line.label}</span>
          </span>
          {line.notes && (
            <Markdown compact className={styles.lineNotes}>
              {line.notes}
            </Markdown>
          )}
        </span>
        <span className={styles.lineAmounts}>
          {line.actual != null && (
            <span className={styles.lineActual}>
              {formatCurrency(line.actual)}
            </span>
          )}
          {line.estimated != null ? (
            <span
              className={`${styles.lineEstimated} ${line.purchased ? styles.lineStruck : ""}`}
            >
              {formatCurrency(line.estimated)}
            </span>
          ) : line.actual == null ? (
            <span className={styles.linePending}>Prix à définir</span>
          ) : null}
        </span>
      </button>
      {line.location && onShowOnMap && (
        <button
          type="button"
          className={styles.lineMap}
          onClick={() => onShowOnMap(line)}
          aria-label="Voir sur la carte"
        >
          <MapPin size={18} />
        </button>
      )}
    </li>
  );
}
