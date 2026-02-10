import type { Country, State } from '../types/location.js';

// Top 50 countries by population/internet usage
export const COUNTRIES: Omit<Country, 'id'>[] = [
  { code: 'USA', name: 'United States', flagEmoji: '🇺🇸' },
  { code: 'GBR', name: 'United Kingdom', flagEmoji: '🇬🇧' },
  { code: 'CAN', name: 'Canada', flagEmoji: '🇨🇦' },
  { code: 'AUS', name: 'Australia', flagEmoji: '🇦🇺' },
  { code: 'DEU', name: 'Germany', flagEmoji: '🇩🇪' },
  { code: 'FRA', name: 'France', flagEmoji: '🇫🇷' },
  { code: 'IND', name: 'India', flagEmoji: '🇮🇳' },
  { code: 'BRA', name: 'Brazil', flagEmoji: '🇧🇷' },
  { code: 'JPN', name: 'Japan', flagEmoji: '🇯🇵' },
  { code: 'KOR', name: 'South Korea', flagEmoji: '🇰🇷' },
  { code: 'MEX', name: 'Mexico', flagEmoji: '🇲🇽' },
  { code: 'ESP', name: 'Spain', flagEmoji: '🇪🇸' },
  { code: 'ITA', name: 'Italy', flagEmoji: '🇮🇹' },
  { code: 'NLD', name: 'Netherlands', flagEmoji: '🇳🇱' },
  { code: 'POL', name: 'Poland', flagEmoji: '🇵🇱' },
  { code: 'ARG', name: 'Argentina', flagEmoji: '🇦🇷' },
  { code: 'PHL', name: 'Philippines', flagEmoji: '🇵🇭' },
  { code: 'TUR', name: 'Turkey', flagEmoji: '🇹🇷' },
  { code: 'IDN', name: 'Indonesia', flagEmoji: '🇮🇩' },
  { code: 'THA', name: 'Thailand', flagEmoji: '🇹🇭' },
  { code: 'VNM', name: 'Vietnam', flagEmoji: '🇻🇳' },
  { code: 'PAK', name: 'Pakistan', flagEmoji: '🇵🇰' },
  { code: 'NGA', name: 'Nigeria', flagEmoji: '🇳🇬' },
  { code: 'EGY', name: 'Egypt', flagEmoji: '🇪🇬' },
  { code: 'ZAF', name: 'South Africa', flagEmoji: '🇿🇦' },
  { code: 'SAU', name: 'Saudi Arabia', flagEmoji: '🇸🇦' },
  { code: 'ARE', name: 'United Arab Emirates', flagEmoji: '🇦🇪' },
  { code: 'MYS', name: 'Malaysia', flagEmoji: '🇲🇾' },
  { code: 'SGP', name: 'Singapore', flagEmoji: '🇸🇬' },
  { code: 'NZL', name: 'New Zealand', flagEmoji: '🇳🇿' },
  { code: 'IRL', name: 'Ireland', flagEmoji: '🇮🇪' },
  { code: 'SWE', name: 'Sweden', flagEmoji: '🇸🇪' },
  { code: 'NOR', name: 'Norway', flagEmoji: '🇳🇴' },
  { code: 'DNK', name: 'Denmark', flagEmoji: '🇩🇰' },
  { code: 'FIN', name: 'Finland', flagEmoji: '🇫🇮' },
  { code: 'CHE', name: 'Switzerland', flagEmoji: '🇨🇭' },
  { code: 'AUT', name: 'Austria', flagEmoji: '🇦🇹' },
  { code: 'BEL', name: 'Belgium', flagEmoji: '🇧🇪' },
  { code: 'PRT', name: 'Portugal', flagEmoji: '🇵🇹' },
  { code: 'GRC', name: 'Greece', flagEmoji: '🇬🇷' },
  { code: 'CZE', name: 'Czech Republic', flagEmoji: '🇨🇿' },
  { code: 'ROU', name: 'Romania', flagEmoji: '🇷🇴' },
  { code: 'HUN', name: 'Hungary', flagEmoji: '🇭🇺' },
  { code: 'ISR', name: 'Israel', flagEmoji: '🇮🇱' },
  { code: 'CHL', name: 'Chile', flagEmoji: '🇨🇱' },
  { code: 'COL', name: 'Colombia', flagEmoji: '🇨🇴' },
  { code: 'PER', name: 'Peru', flagEmoji: '🇵🇪' },
  { code: 'UKR', name: 'Ukraine', flagEmoji: '🇺🇦' },
  { code: 'CHN', name: 'China', flagEmoji: '🇨🇳' },
  { code: 'RUS', name: 'Russia', flagEmoji: '🇷🇺' },
];

// US States
export const US_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];

// Canadian Provinces
export const CA_PROVINCES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

// UK Countries
export const UK_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'ENG', name: 'England' },
  { code: 'SCT', name: 'Scotland' },
  { code: 'WLS', name: 'Wales' },
  { code: 'NIR', name: 'Northern Ireland' },
];

// Australian States
export const AU_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

// German States (Bundesländer)
export const DE_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'BE', name: 'Berlin' },
  { code: 'BY', name: 'Bavaria' },
  { code: 'BW', name: 'Baden-Württemberg' },
  { code: 'HE', name: 'Hesse' },
  { code: 'NW', name: 'North Rhine-Westphalia' },
  { code: 'NI', name: 'Lower Saxony' },
  { code: 'SN', name: 'Saxony' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'RP', name: 'Rhineland-Palatinate' },
  { code: 'SH', name: 'Schleswig-Holstein' },
];

// French Regions
export const FR_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'IDF', name: 'Île-de-France (Paris)' },
  { code: 'ARA', name: 'Auvergne-Rhône-Alpes' },
  { code: 'NAQ', name: 'Nouvelle-Aquitaine' },
  { code: 'OCC', name: 'Occitanie' },
  { code: 'HDF', name: 'Hauts-de-France' },
  { code: 'GES', name: 'Grand Est' },
  { code: 'PAC', name: "Provence-Alpes-Côte d'Azur" },
  { code: 'PDL', name: 'Pays de la Loire' },
  { code: 'BRE', name: 'Brittany' },
  { code: 'NOR', name: 'Normandy' },
];

// Indian States
export const IN_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'MH', name: 'Maharashtra' },
  { code: 'DL', name: 'Delhi' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'TG', name: 'Telangana' },
  { code: 'KL', name: 'Kerala' },
];

// Brazilian States
export const BR_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'SP', name: 'São Paulo' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'BA', name: 'Bahia' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Federal District (Brasília)' },
  { code: 'SC', name: 'Santa Catarina' },
];

// Japanese Regions
export const JP_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'TK', name: 'Tokyo' },
  { code: 'OS', name: 'Osaka' },
  { code: 'KN', name: 'Kanagawa' },
  { code: 'AI', name: 'Aichi' },
  { code: 'FK', name: 'Fukuoka' },
  { code: 'HK', name: 'Hokkaido' },
  { code: 'HG', name: 'Hyogo' },
  { code: 'KT', name: 'Kyoto' },
  { code: 'ST', name: 'Saitama' },
  { code: 'CB', name: 'Chiba' },
];

// South Korean Regions
export const KR_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'SEO', name: 'Seoul' },
  { code: 'PUS', name: 'Busan' },
  { code: 'ICN', name: 'Incheon' },
  { code: 'DGU', name: 'Daegu' },
  { code: 'DJN', name: 'Daejeon' },
  { code: 'GWJ', name: 'Gwangju' },
  { code: 'GGI', name: 'Gyeonggi' },
  { code: 'GNM', name: 'South Gyeongsang' },
  { code: 'GBK', name: 'North Gyeongsang' },
  { code: 'JJU', name: 'Jeju' },
];

// Mexican States
export const MX_STATES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'CMX', name: 'Mexico City' },
  { code: 'JAL', name: 'Jalisco' },
  { code: 'NLE', name: 'Nuevo León' },
  { code: 'MEX', name: 'State of Mexico' },
  { code: 'VER', name: 'Veracruz' },
  { code: 'PUE', name: 'Puebla' },
  { code: 'GUA', name: 'Guanajuato' },
  { code: 'CHH', name: 'Chihuahua' },
  { code: 'TAM', name: 'Tamaulipas' },
  { code: 'BCN', name: 'Baja California' },
];

// Spanish Autonomous Communities
export const ES_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'MD', name: 'Madrid' },
  { code: 'CT', name: 'Catalonia' },
  { code: 'AN', name: 'Andalusia' },
  { code: 'VC', name: 'Valencia' },
  { code: 'GA', name: 'Galicia' },
  { code: 'PV', name: 'Basque Country' },
  { code: 'CL', name: 'Castile and León' },
  { code: 'CN', name: 'Canary Islands' },
  { code: 'AR', name: 'Aragon' },
  { code: 'IB', name: 'Balearic Islands' },
];

// Italian Regions
export const IT_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'LOM', name: 'Lombardy' },
  { code: 'LAZ', name: 'Lazio (Rome)' },
  { code: 'CAM', name: 'Campania' },
  { code: 'VEN', name: 'Veneto' },
  { code: 'EMR', name: 'Emilia-Romagna' },
  { code: 'PIE', name: 'Piedmont' },
  { code: 'SIC', name: 'Sicily' },
  { code: 'TOS', name: 'Tuscany' },
  { code: 'PUG', name: 'Apulia' },
  { code: 'LIG', name: 'Liguria' },
];

// Dutch Provinces
export const NL_PROVINCES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'NH', name: 'North Holland' },
  { code: 'ZH', name: 'South Holland' },
  { code: 'NB', name: 'North Brabant' },
  { code: 'GE', name: 'Gelderland' },
  { code: 'UT', name: 'Utrecht' },
  { code: 'OV', name: 'Overijssel' },
  { code: 'LI', name: 'Limburg' },
  { code: 'FR', name: 'Friesland' },
  { code: 'GR', name: 'Groningen' },
  { code: 'FL', name: 'Flevoland' },
];

// Polish Voivodeships
export const PL_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'MZ', name: 'Masovia (Warsaw)' },
  { code: 'MA', name: 'Lesser Poland' },
  { code: 'SL', name: 'Silesia' },
  { code: 'WP', name: 'Greater Poland' },
  { code: 'DS', name: 'Lower Silesia' },
  { code: 'PM', name: 'Pomerania' },
  { code: 'LD', name: 'Łódź' },
  { code: 'ZP', name: 'West Pomerania' },
  { code: 'LU', name: 'Lublin' },
  { code: 'PK', name: 'Subcarpathia' },
];

// Philippine Regions
export const PH_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'NCR', name: 'Metro Manila' },
  { code: 'CAL', name: 'Calabarzon' },
  { code: 'CEN', name: 'Central Luzon' },
  { code: 'WVI', name: 'Western Visayas' },
  { code: 'CVI', name: 'Central Visayas' },
  { code: 'DAV', name: 'Davao Region' },
  { code: 'NMI', name: 'Northern Mindanao' },
  { code: 'ILO', name: 'Ilocos Region' },
  { code: 'BIC', name: 'Bicol Region' },
  { code: 'CAR', name: 'Cordillera' },
];

// Turkish Regions
export const TR_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'IST', name: 'Istanbul' },
  { code: 'ANK', name: 'Ankara' },
  { code: 'IZM', name: 'Izmir' },
  { code: 'BUR', name: 'Bursa' },
  { code: 'ANT', name: 'Antalya' },
  { code: 'ADN', name: 'Adana' },
  { code: 'KON', name: 'Konya' },
  { code: 'GAZ', name: 'Gaziantep' },
  { code: 'MER', name: 'Mersin' },
  { code: 'KAY', name: 'Kayseri' },
];

// Indonesian Provinces
export const ID_PROVINCES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'JKT', name: 'Jakarta' },
  { code: 'JBR', name: 'West Java' },
  { code: 'JTM', name: 'East Java' },
  { code: 'JTG', name: 'Central Java' },
  { code: 'BTN', name: 'Banten' },
  { code: 'SUM', name: 'North Sumatra' },
  { code: 'SUL', name: 'South Sulawesi' },
  { code: 'RIA', name: 'Riau' },
  { code: 'SSU', name: 'South Sumatra' },
  { code: 'BAL', name: 'Bali' },
];

// Thai Regions
export const TH_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'BKK', name: 'Bangkok' },
  { code: 'CNX', name: 'Chiang Mai' },
  { code: 'PKT', name: 'Phuket' },
  { code: 'KKN', name: 'Khon Kaen' },
  { code: 'NMA', name: 'Nakhon Ratchasima' },
  { code: 'UDN', name: 'Udon Thani' },
  { code: 'SRN', name: 'Surat Thani' },
  { code: 'HDY', name: 'Hat Yai' },
  { code: 'PBI', name: 'Pathum Thani' },
  { code: 'NBI', name: 'Nonthaburi' },
];

// Argentine Provinces
export const AR_PROVINCES: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'BA', name: 'Buenos Aires' },
  { code: 'CF', name: 'Buenos Aires City' },
  { code: 'CO', name: 'Córdoba' },
  { code: 'SF', name: 'Santa Fe' },
  { code: 'MZ', name: 'Mendoza' },
  { code: 'TU', name: 'Tucumán' },
  { code: 'SA', name: 'Salta' },
  { code: 'ER', name: 'Entre Ríos' },
  { code: 'MI', name: 'Misiones' },
  { code: 'CH', name: 'Chaco' },
];

// Chinese Regions
export const CN_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'BJ', name: 'Beijing' },
  { code: 'SH', name: 'Shanghai' },
  { code: 'GD', name: 'Guangdong' },
  { code: 'JS', name: 'Jiangsu' },
  { code: 'ZJ', name: 'Zhejiang' },
  { code: 'SD', name: 'Shandong' },
  { code: 'HN', name: 'Henan' },
  { code: 'SC', name: 'Sichuan' },
  { code: 'HB', name: 'Hubei' },
  { code: 'FJ', name: 'Fujian' },
];

// Russian Federal Subjects
export const RU_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'MOW', name: 'Moscow' },
  { code: 'SPE', name: 'Saint Petersburg' },
  { code: 'MOS', name: 'Moscow Oblast' },
  { code: 'KDA', name: 'Krasnodar Krai' },
  { code: 'SVE', name: 'Sverdlovsk Oblast' },
  { code: 'ROS', name: 'Rostov Oblast' },
  { code: 'TAT', name: 'Tatarstan' },
  { code: 'BA', name: 'Bashkortostan' },
  { code: 'CHE', name: 'Chelyabinsk Oblast' },
  { code: 'NSK', name: 'Novosibirsk Oblast' },
];

// New Zealand Regions
export const NZ_REGIONS: Omit<State, 'id' | 'countryId'>[] = [
  { code: 'AUK', name: 'Auckland' },
  { code: 'WGN', name: 'Wellington' },
  { code: 'CAN', name: 'Canterbury' },
  { code: 'WKO', name: 'Waikato' },
  { code: 'BOP', name: 'Bay of Plenty' },
  { code: 'OTA', name: 'Otago' },
  { code: 'MWT', name: 'Manawatū-Whanganui' },
  { code: 'HKB', name: "Hawke's Bay" },
  { code: 'NTL', name: 'Northland' },
  { code: 'TAS', name: 'Tasman' },
];

// Map country code to states
export const STATES_BY_COUNTRY: Record<string, Omit<State, 'id' | 'countryId'>[]> = {
  USA: US_STATES,
  CAN: CA_PROVINCES,
  GBR: UK_REGIONS,
  AUS: AU_STATES,
  DEU: DE_STATES,
  FRA: FR_REGIONS,
  IND: IN_STATES,
  BRA: BR_STATES,
  JPN: JP_REGIONS,
  KOR: KR_REGIONS,
  MEX: MX_STATES,
  ESP: ES_REGIONS,
  ITA: IT_REGIONS,
  NLD: NL_PROVINCES,
  POL: PL_REGIONS,
  PHL: PH_REGIONS,
  TUR: TR_REGIONS,
  IDN: ID_PROVINCES,
  THA: TH_REGIONS,
  ARG: AR_PROVINCES,
  CHN: CN_REGIONS,
  RUS: RU_REGIONS,
  NZL: NZ_REGIONS,
};
