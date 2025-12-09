export const getGuardrailIcon = (iconType: 'shield' | 'lock' | 'clock'): string => {
  switch (iconType) {
    case 'shield':
      return 'shield-regular';
    case 'lock':
      return 'lock-regular';
    case 'clock':
      return 'clock-regular';
    default:
      return 'info-regular';
  }
};





