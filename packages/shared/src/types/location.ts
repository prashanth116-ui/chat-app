export interface Country {
  id: number;
  name: string;
  code: string; // ISO 3166-1 alpha-3
  flagEmoji: string;
}

export interface State {
  id: number;
  countryId: number;
  name: string;
  code: string | null;
}

export interface CountryWithStates extends Country {
  states: State[];
}

export interface LocationFilter {
  countryId?: number;
  stateId?: number;
}
