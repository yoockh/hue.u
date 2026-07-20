function mapToSeason(undertone, contrast) {
  // Resolve neutral undertone to cool-neutral for mapping purposes
  const normalizedUndertone = undertone === 'neutral' ? 'cool' : undertone;

  if (normalizedUndertone === 'warm') {
    return contrast === 'high' ? 'spring' : 'autumn';
  } else {
    return contrast === 'high' ? 'winter' : 'summer';
  }
}

module.exports = { mapToSeason };
