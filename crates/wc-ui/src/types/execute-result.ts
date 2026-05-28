export interface ExecuteResult {
  bundle_path: string | null;
  packed_count: number;
  locked_files: string[];
  needs_user_decision: boolean;
}
