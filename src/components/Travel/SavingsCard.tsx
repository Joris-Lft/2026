import { useMemo } from "react";
import { ChevronRight, PiggyBank } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { useDeposits } from "@/hooks/use-travel-savings";
import styles from "./SavingsCard.module.css";

const currency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function SavingsCard() {
  const { data: deposits = [] } = useDeposits();

  const total = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits],
  );

  return (
    <Card padded className={styles.card}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>
          <PiggyBank size={18} />
          Cagnotte voyage
        </span>
        <span className={styles.total}>{currency.format(total)}</span>
      </div>

      <Link to="/voyages/cagnotte" className={styles.link}>
        Historique des versements
        <ChevronRight size={16} />
      </Link>
    </Card>
  );
}
