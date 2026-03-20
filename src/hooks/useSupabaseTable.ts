import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

type ColumnMap = Record<string, string>; // camelCase -> snake_case

function toSnake(obj: Record<string, unknown>, map: ColumnMap): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[map[key] || key] = value;
  }
  return result;
}

function toCamel(obj: Record<string, unknown>, map: ColumnMap): Record<string, unknown> {
  const reverse: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(map)) {
    reverse[snake] = camel;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "id" || key === "sort_order") continue; // skip DB-only fields
    result[reverse[key] || key] = value;
  }
  return result;
}

interface UseSupabaseTableOptions<T> {
  table: string;
  localStorageKey: string;
  initialValue: T[];
  columnMap?: ColumnMap; // camelCase keys -> snake_case columns
}

export function useSupabaseTable<T extends object>({
  table,
  localStorageKey,
  initialValue,
  columnMap = {},
}: UseSupabaseTableOptions<T>): [T[], React.Dispatch<React.SetStateAction<T[]>>, boolean] {
  const [data, setData] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from(table)
          .select("*")
          .order("sort_order");

        if (error) throw error;

        if (rows && rows.length > 0) {
          const mapped = rows.map((row) => toCamel(row, columnMap) as T);
          setData(mapped);
        } else {
          // Supabase is empty — migrate localStorage data
          const local = localStorage.getItem(localStorageKey);
          if (local) {
            const parsed: T[] = JSON.parse(local);
            if (parsed.length > 0) {
              const inserts = parsed.map((item, i) => ({
                ...toSnake(item as Record<string, unknown>, columnMap),
                sort_order: i,
              }));
              await supabase.from(table).insert(inserts);
            }
          }
        }
      } catch (e) {
        console.warn(`Supabase load failed for ${table}, using localStorage`, e);
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    })();
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to Supabase on change (debounced)
  useEffect(() => {
    if (isInitialLoad.current) return;

    // Also save to localStorage as backup
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch { /* ignore */ }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        // Delete all rows and re-insert (simple approach for small datasets)
        await supabase.from(table).delete().gte("id", 0);
        if (data.length > 0) {
          const inserts = data.map((item, i) => ({
            ...toSnake(item as Record<string, unknown>, columnMap),
            sort_order: i,
          }));
          await supabase.from(table).insert(inserts);
        }
      } catch (e) {
        console.warn(`Supabase save failed for ${table}`, e);
      }
    }, 500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return [data, setData, loading];
}
