# Model contract
Version 1 is a deterministic single-SKU lost-sales inventory simulation. Each supplier is evaluated independently under identical policy inputs; this is a comparison, not a split-sourcing network optimization.

## Daily event order
1. Receive orders due today.
2. Serve fixed daily demand from on-hand stock; unmet demand is lost, not backlogged.
3. Charge holding cost on remaining stock and the declared penalty on lost units.
4. If on-hand plus all in-transit units is at or below the reorder point, place one order of min(orderQty, supplier.capacity).
5. The order arrives on day + leadDays. Disruption adds delayDays and multiplies daily demand by demandMultiplier throughout the entire horizon.

Capacity means maximum units per order, not daily production throughput. Multiple orders may be in transit. Lead time is at least one day. All quantities except day counts may be fractional. No pre-horizon pipeline exists. Initial stock is treated as a sunk resource with no purchase charge.

## Metrics
Fill rate = fulfilled / requested demand; zero demand returns null (N/A).
Purchase cost includes unit and fixed ordering costs for every order placed during the horizon, including unreceived orders. Total modeled cost adds holding and shortage penalties. Ending inventory and in-transit stock have no salvage credit. Comparisons can be sensitive to horizon end effects.

Currency is owner-declared and must be consistent. Results are scenario arithmetic, not probabilistic confidence intervals, predictions, validated service guarantees, or recommendations. No supplier reliability probabilities, route optimization, multi-echelon flows, seasonality, taxes, working capital, carbon accounting, or live ERP integration is implemented.

## Reproducibility and evidence
Study JSON is the canonical input. The same input produces the same result; no random sampler is used. Notes can record source references, dates, assumptions and reviewer rationale but do not authenticate evidence. Save persists only in the same browser/origin. JSON, CSV and Markdown exports are ordinary files, not signed audit records.

## Evaluation plan
Before using real data, reconcile units and demand history; compare against observed receipt and stock records; assess horizon and policy sensitivity; and have a domain reviewer document limitations. Browser keyboard, mobile and import/export testing remains necessary.
