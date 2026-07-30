export type Travel = {
  id: string;
  name: string;
  coverUrl: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
};

export type TravelFormInput = {
  name: string;
  /** URL déjà uploadée de la photo de couverture (null si aucune). */
  coverUrl: string | null;
};

export type CreateTravelInput = TravelFormInput;

/** Champs éditables de la section Aperçu. */
export type TravelDetailsInput = {
  name: string;
  coverUrl: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type UpdateTravelInput = TravelDetailsInput & {
  id: string;
};
