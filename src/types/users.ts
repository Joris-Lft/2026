export type UserOption = {
  id: string;
  email: string;
};

export type UserDirectory = {
  users: UserOption[];
  emailToId: Map<string, string>;
  idToEmail: Map<string, string>;
};
