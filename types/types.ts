type RootStackParamList = {
    index: undefined;
    signup: undefined;
    "(tabs)": undefined;
    "(auth": undefined;
    Chat: { companyId: string };
  };
  export default RootStackParamList;

  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    ice?: string;  // `ice` est optionnel car il ne sera présent que si `isCompany` est `true`
  }

  export interface Car {
    _id: string;
    marque: string;
    modele: string;
    images: string[];
    statut: string;
    entrepriseId: string;
    annee: number;
    couleur: string;
    price:number;
    kilometrage: number;

  }