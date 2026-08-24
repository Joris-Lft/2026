export type Deposit = {
  id: string;
  amount: number;
  author: string;
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
};

export type UpdateDepositInput = CreateDepositInput & {
  id: string;
};
