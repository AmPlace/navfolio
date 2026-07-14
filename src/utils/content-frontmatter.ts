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

function normalizeStickyValue(...values: unknown[]): boolean | number | undefined {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== '',
  );

  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : false;
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false' || normalized === '0') return false;

  const priority = Number(normalized);
  return Number.isFinite(priority) && priority > 0 ? priority : undefined;
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
  const sticky = normalizeStickyValue(normalized.sticky, normalized.top);
  if (sticky === undefined) delete normalized.sticky;
  else normalized.sticky = sticky;

  return normalized;
}
