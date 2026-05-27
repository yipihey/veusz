import type { SettingSchema } from '../../rpc/types';

export interface LeafProps {
  schema: SettingSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Sibling values in the same Settings group. AxisBound uses this to
   *  swap between date/number based on the parent axis mode. */
  siblings?: Record<string, unknown>;
}
