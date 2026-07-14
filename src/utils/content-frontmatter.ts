type FrontmatterRecord = Record<string, unknown>;

function isRecord(value: unknown): value is FrontmatterRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' || typeof item === 'number' ? String(item) : ''))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const item = String(value).trim();
    return item ? [item] : [];
  }

  return [];
}

function firstNonEmptyString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.trim() !== '');
}

function normalizeImagePath(value: string | undefined) {
  if (!value) return undefined;
  const path = value.trim();
  if (!path) return undefined;
  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith('/')) return path;
  return '/' + path.replace(/^\.\//, '');
}

export function normalizeArticleFrontmatter(value: unknown): unknown {
  if (!isRecord(value)) return value;

  const normalized = { ...value };
  const description = firstNonEmptyString(
    normalized.description,
    normalized.excerpt,
    normalized.summary,
  );
  const heroImage = normalizeImagePath(
    firstNonEmptyString(normalized.heroImage, normalized.cover, normalized.top_img),
  );

  normalized.description = description ?? '';
  normalized.tags = toStringArray(normalized.tags);
  normalized.categories = toStringArray(normalized.categories);
  normalized.series = toStringArray(normalized.series);

  if (heroImage) normalized.heroImage = heroImage;
  else delete normalized.heroImage;
  if (normalized.sticky === undefined && normalized.top !== undefined) {
    normalized.sticky = normalized.top;
  }

  return normalized;
}
