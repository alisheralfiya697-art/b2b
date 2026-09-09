export function getCountryFlag(country: string): string {
  switch (country.toLowerCase().trim()) {
    case 'usa':
    case 'united states':
      return '🇺🇸';
    case 'canada':
      return '🇨🇦';
    case 'australia':
      return '🇦🇺';
    case 'netherlands':
      return '🇳🇱';
    case 'germany':
      return '🇩🇪';
    case 'india':
      return '🇮🇳';
    case 'uk':
    case 'united kingdom':
      return '🇬🇧';
    default:
      return '🌐';
  }
}
