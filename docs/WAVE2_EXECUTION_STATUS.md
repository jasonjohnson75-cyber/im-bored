# Wave 2 Execution Status

Implemented on `wave2-adapters`:
- Reusable schema.org JSON-LD Event extractor.
- First four Wave 2 adapter definitions: City of Mishawaka, Downtown South Bend, City of Buchanan, Niles Main Street.
- JSON-LD fixture tests including venue/ticket/free/cancellation behavior.
- Live dry-run test harness that validates reachability and normalized event invariants without production writes.
- GitHub Actions workflow for Wave 2 source tests.
- Source coverage audit framework, Wave 3 qualification queue, discovery notes and consolidated pre-launch audit checklist.

Important verification rule: an adapter definition is not equivalent to a production-validated source. The live workflow must prove the source actually exposes usable machine-readable event records. Zero-event results are not automatically considered production proof.

No production Supabase writes were enabled by this branch.
