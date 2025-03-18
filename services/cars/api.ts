

export const fetchBrands = async (): Promise<string[]> => {

    return [
      "Audi",
      "BMW",
      "Citroën",
      "Dacia",
      "Fiat",
      "Ford",
      "Honda",
      "Hyundai",
      "Kia",
      "Mercedes",
      "Nissan",
      "Opel",
      "Peugeot",
      "Renault",
      "Toyota",
      "Volkswagen",
    ]
  }


export const fetchModels = async (brand: string): Promise<string[]> => {
 
    const defaultModels: Record<string, string[]> = {
      Audi: ["A1", "A3", "A4", "Q3", "Q5"],
      BMW: ["Série 1", "Série 3", "X1", "X3", "X5"],
      Citroën: ["C3", "C4", "Berlingo", "DS3"],
      Dacia: ["Duster", "Sandero", "Logan"],
      Fiat: ["500", "Panda", "Tipo"],
      Ford: ["Fiesta", "Focus", "Kuga"],
      Honda: ["Civic", "CR-V", "Jazz"],
      Hyundai: ["i10", "i20", "i30", "Tucson"],
      Kia: ["Picanto", "Rio", "Sportage"],
      Mercedes: ["Classe A", "Classe C", "GLA", "GLC"],
      Nissan: ["Micra", "Juke", "Qashqai"],
      Opel: ["Corsa", "Astra", "Mokka"],
      Peugeot: ["208", "308", "3008", "5008"],
      Renault: ["Clio", "Captur", "Megane"],
      Toyota: ["Yaris", "Corolla", "RAV4"],
      Volkswagen: ["Polo", "Golf", "Tiguan"],
    }
    return defaultModels[brand] || []
  }


export const fetchColors = async (): Promise<string[]> => {

    return ["Blanc", "Noir", "Gris", "Argent", "Bleu", "Rouge", "Vert", "Jaune", "Orange", "Marron"]

}

