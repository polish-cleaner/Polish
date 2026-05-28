export interface SegmentedOption<V extends string = string> {
  value: V;
  label: string;
}

export interface SegmentedProps<V extends string = string> {
  value: V;
  onValueChange: (value: V) => void;
  options: ReadonlyArray<SegmentedOption<V>>;
  "aria-label"?: string;
  className?: string;
}
