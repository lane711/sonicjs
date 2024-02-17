export function singularize(word: string) {
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) {
    return word.slice(0, -3);
  }
  if (word.endsWith('shes') || word.endsWith('ches')) {
    return word.slice(0, -4);
  }

  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }

  return word.slice(0, -1);
}
