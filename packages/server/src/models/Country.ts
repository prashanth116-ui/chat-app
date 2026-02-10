import { query } from '../config/database.js';
import type { Country, State } from '@chat-app/shared';

interface CountryRow {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
}

interface StateRow {
  id: number;
  country_id: number;
  name: string;
  code: string | null;
}

function rowToCountry(row: CountryRow): Country {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    flagEmoji: row.flag_emoji,
  };
}

function rowToState(row: StateRow): State {
  return {
    id: row.id,
    countryId: row.country_id,
    name: row.name,
    code: row.code,
  };
}

export async function getAllCountries(): Promise<Country[]> {
  const result = await query<CountryRow>(
    'SELECT * FROM countries ORDER BY name'
  );
  return result.rows.map(rowToCountry);
}

export async function getCountryById(id: number): Promise<Country | null> {
  const result = await query<CountryRow>(
    'SELECT * FROM countries WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? rowToCountry(result.rows[0]) : null;
}

export async function getCountryByCode(code: string): Promise<Country | null> {
  const result = await query<CountryRow>(
    'SELECT * FROM countries WHERE code = $1',
    [code]
  );
  return result.rows.length > 0 ? rowToCountry(result.rows[0]) : null;
}

export async function getStatesByCountry(countryId: number): Promise<State[]> {
  const result = await query<StateRow>(
    'SELECT * FROM states WHERE country_id = $1 ORDER BY name',
    [countryId]
  );
  return result.rows.map(rowToState);
}

export async function getStateById(id: number): Promise<State | null> {
  const result = await query<StateRow>(
    'SELECT * FROM states WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? rowToState(result.rows[0]) : null;
}
