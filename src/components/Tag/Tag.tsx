import styles from "./Tag.module.css";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function Tag({ label, selected = false, onClick, onRemove }: TagProps) {
  const isFilter = !!onClick;
  const isRemovable = !!onRemove;

  if (isFilter) {
    return (
      <button
        type="button"
        className={joinClasses(
          styles.tag,
          styles.filter,
          selected && styles.filterSelected,
        )}
        onClick={onClick}
        aria-pressed={selected}
      >
        <span className={styles.label}>{label}</span>
      </button>
    );
  }

  return (
    <span
      className={joinClasses(styles.tag, isRemovable && styles.removable)}
    >
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Retirer le tag ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  className?: string;
}

export function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={joinClasses(styles.list, className)}>
      {tags.map((tag) => (
        <Tag key={tag} label={tag} />
      ))}
    </div>
  );
}

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
}

export function TagFilter({ tags, selectedTags, onChange }: TagFilterProps) {
  if (tags.length === 0) return null;

  const toggleTag = (tag: string) => {
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((item) => item !== tag)
        : [...selectedTags, tag],
    );
  };

  return (
    <div className={styles.filterBar}>
      <span className={styles.filterLabel}>Filtrer</span>
      <div className={styles.filterTags}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            selected={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
          />
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange([])}
        >
          Tout afficher
        </button>
      )}
    </div>
  );
}

interface TagSelectProps {
  options: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  emptyMessage?: string;
}

export function TagSelect({
  options,
  value,
  onChange,
  disabled = false,
  emptyMessage = "Aucun tag disponible",
}: TagSelectProps) {
  if (options.length === 0) {
    return <p className={styles.emptyMessage}>{emptyMessage}</p>;
  }

  const toggleTag = (tag: string) => {
    if (disabled) return;

    onChange(
      value.includes(tag)
        ? value.filter((item) => item !== tag)
        : [...value, tag],
    );
  };

  return (
    <div
      className={joinClasses(
        styles.tagSelect,
        disabled && styles.tagSelectDisabled,
      )}
      role="group"
      aria-label="Sélection des tags"
    >
      {options.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          selected={value.includes(tag)}
          onClick={() => toggleTag(tag)}
        />
      ))}
    </div>
  );
}
