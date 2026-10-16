# Bounded attention literature pilot

Question: How do two selected neural machine translation abstracts describe the
role of attention, and what can those abstracts support about architecture?

Scope: two deliberately chosen public arXiv records, originally submitted in
2014 and 2017. Include their current abstract/metadata pages; exclude full-text
claims, replication, benchmark comparison and later literature. Accessed
2026-10-16 through public browser retrieval, without upstream helper execution.

S1 describes addressing a fixed-vector encoder/decoder bottleneck by allowing
the model to focus softly on relevant source positions. S2 describes a Transformer
architecture built around attention without recurrence or convolution.
These statements support a limited architectural comparison. They do not by
themselves establish which architecture performs better under matched conditions.
[S1, abstract](https://arxiv.org/abs/1409.0473v7),
[S2, abstract](https://arxiv.org/abs/1706.03762v7).

The [evidence table](evidence.csv) distinguishes reported source claims from our
inference. The [bibliography](sources.bib) cites the arXiv records using original
submission years; version and access details are in [provenance](provenance.json).
No quantitative outcome is reproduced. Evidence location is the abstract, not an
unread figure or invented page number.

Limitations: purposeful two-record selection, English-only, abstract-level
screening, no exhaustive search, no risk-of-bias score, no full-text verification,
no replication and no independent review. Generalization to all attention models
or research domains is unsupported. A later live pilot should record its actual
searches, failures and screening decisions; do not relabel this fixture as that
live run. Critical appraisal and Markdown output need neither PDF export nor
AI diagrams, paid providers or Scholar scraping.
