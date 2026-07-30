import { MapPin } from "lucide-react";
import type { Travel } from "@/types/travels";
import type { TravelBudgetTotals } from "@/types/travel-budget";
import { Card } from "@/components/ui/Card";
import { BudgetProgress } from "./BudgetProgress";
import styles from "./TravelCard.module.css";

interface TravelCardProps {
  travel: Travel;
  /** Budget prévisionnel par niveau de dépense et montant déjà mis de côté. */
  budget?: { totals: TravelBudgetTotals; saved: number };
  onOpen?: (travel: Travel) => void;
}

export function TravelCard({ travel, budget, onOpen }: TravelCardProps) {
  return (
    <Card
      as="button"
      className={styles.card}
      onClick={() => onOpen?.(travel)}
      aria-label={`Ouvrir le voyage ${travel.name}`}
    >
      <div className={styles.cover}>
        {travel.coverUrl ? (
          <img
            src={travel.coverUrl}
            alt=""
            className={styles.coverImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden>
            <MapPin size={28} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{travel.name}</h3>

        {budget && budget.totals.total > 0 && (
          <div className={styles.budget}>
            <BudgetProgress totals={budget.totals} saved={budget.saved} />
          </div>
        )}
      </div>
    </Card>
  );
}
