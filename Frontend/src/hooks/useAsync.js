import { useCallback, useEffect, useState } from "react";
export default function useAsync(task, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const run = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await task()); }
    catch (e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run, setData };
}
