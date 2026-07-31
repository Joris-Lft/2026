import { ChevronRight, PiggyBank } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { useAvailableSavings } from "@/hooks/use-travel-savings";
import { formatCurrency } from "@/utils/format";
import styles from "./SavingsCard.module.css";

export function SavingsCard() {
  const { available } = useAvailableSavings();

  return (
    <Card padded className={styles.card}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>
          <PiggyBank size={18} />
          Cagnotte commune
        </span>
        <span className={styles.total}>{formatCurrency(available)}</span>
      </div>

      <Link to="/voyages/cagnotte" className={styles.link}>
        Historique des versements
        <ChevronRight size={16} />
      </Link>
    </Card>
  );
}
