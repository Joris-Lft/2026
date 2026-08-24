export type Deposit = {
  id: string;
  amount: number;
  author: string;
  /** Email du propriétaire pour un versement perso ; vide pour la cagnotte commune. */
  userId: string;
  date: string;
  note: string;
};

/** Champs éditables du formulaire (l'auteur est ajouté par le parent). */
export type DepositFormValue = {
  amount: number;
  date: string;
  note: string;
};

export type CreateDepositInput = DepositFormValue & {
  author: string;
  userId: string;
};

export type UpdateDepositInput = CreateDepositInput & {
  id: string;
};
