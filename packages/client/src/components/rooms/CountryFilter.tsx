import { useCountries, useStates } from '../../hooks/useRooms';
import styles from './CountryFilter.module.css';

interface CountryFilterProps {
  selectedCountryId?: number;
  selectedStateId?: number;
  onCountryChange: (countryId: number | undefined) => void;
  onStateChange: (stateId: number | undefined) => void;
}

export function CountryFilter({
  selectedCountryId,
  selectedStateId,
  onCountryChange,
  onStateChange,
}: CountryFilterProps) {
  const { countries, isLoading: countriesLoading } = useCountries();
  const { states, isLoading: statesLoading } = useStates(selectedCountryId);

  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={selectedCountryId ?? ''}
        onChange={(e) => {
          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
          onCountryChange(value);
          onStateChange(undefined);
        }}
        disabled={countriesLoading}
      >
        <option value="">All countries</option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.flagEmoji} {country.name}
          </option>
        ))}
      </select>

      {selectedCountryId && states.length > 0 && (
        <select
          className={styles.select}
          value={selectedStateId ?? ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onStateChange(value);
          }}
          disabled={statesLoading}
        >
          <option value="">All states</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
