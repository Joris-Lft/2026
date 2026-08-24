import { ChevronRight, PiggyBank } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/ui/Card";
import { PROJECT_SCOPES, type ProjectScope } from "@/constants/project-scope";
import { useAvailableSavings } from "@/hooks/use-travel-savings";
import { formatCurrency } from "@/utils/format";
import styles from "./SavingsCard.module.css";

type SavingsCardProps = {
  scope: ProjectScope;
};

export function SavingsCard({ scope }: SavingsCardProps) {
  const { basePath, savingsLabel } = PROJECT_SCOPES[scope];
  const { available } = useAvailableSavings(scope);

  return (
    <Card padded className={styles.card}>
      <div className={styles.titleBlock}>
        <span className={styles.title}>
          <PiggyBank size={18} />
          {savingsLabel}
        </span>
        <span className={styles.total}>{formatCurrency(available)}</span>
      </div>

      <Link to={`${basePath}/cagnotte`} className={styles.link}>
        Historique des versements
        <ChevronRight size={16} />
      </Link>
    </Card>
  );
}
