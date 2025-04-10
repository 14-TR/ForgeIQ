
# **Init Testing**: DSPy Optimized Module  
**DATE**: 04/09/2025

### **NLQ-to-SQL Performance Evaluation via DSPy (Optimized)**

---

#### **System Context and Setup**

- **LLM Provider**: OpenAI, securely configured via AWS Secrets Manager.  
- **Module Used**: `optimized_nlq_module.json` successfully loaded and active.  
- **Database**: SQLite (local); single table – `transactions`.  
- **File Source**: `sample.csv` parsed and ingested with schema conformity.  
- **Execution Context**: Sequential batch run of predefined NLQs for module evaluation.

---

#### **1. Semantic Fidelity Evaluation**

**Accurate and Fully Aligned Queries**

The following NLQs were correctly translated and executed, yielding expected results with full schema compliance:

- `Show all data for the brand 'Wingstop'`
- `What is the total spend for Subway?`
- `How many records are there for Walmart?`
- `Show the brand and number of customers for Domino's Pizza`
- `List all unique brands`
- `Which 5 brands had the highest total spend?`
- `What is the average total spend per brand?`
- `Show data for brands containing the word 'Pizza'`

All executed queries demonstrated high alignment between semantic intent and SQL structure, utilizing `LIKE`, `GROUP BY`, `DISTINCT`, and `ORDER BY` clauses appropriately.

---

**Partial Failures / Semantic Drift**

- **Query**: `List brands with more than 500 transactions`
  - **Issue**: Parameter parsed as a string: `['500']`
  - **Impact**: SQLite accepted the string due to implicit casting; however, other engines may not.
  - **Recommendation**: Enforce numeric typecasting during prompt completion or apply post-coercion before SQL binding.

- **Query**: `Which named brand had the lowest total spend?`
  - **Issue**: Returned `BRANDS = None` despite instruction to isolate named entities.
  - **Impact**: Obscures interpretation and introduces noise into aggregate evaluations.
  - **Recommendation**: Amend prompt logic to inject SQL clause:  
    `WHERE BRANDS IS NOT NULL AND BRANDS != 'None'`

---

#### **2. Performance Evaluation: Translation vs Execution**

| Metric                | Mean Time (Seconds) |
|-----------------------|---------------------|
| NLQ Translation Time  | ~2.16               |
| SQL Execution Time    | < 0.0002            |

**Conclusion**: Translation continues to be the primary performance bottleneck. Execution via SQLite remains negligible. Despite optimization, LLM latency must be addressed for real-time application viability.

---

#### **3. Data Integrity Observations**

- Numerous queries return rows with `BRANDS = None` despite target queries implying semantic filters.
- Aggregates and rank-based outputs are distorted by these non-informative entries.
- Nested fields (e.g., JSON-encoded columns like `SPEND_BY_DAY`) are unparsed and unusable in SQL-native evaluation.

**Recommendation**:  
- Normalize CSV inputs or pre-process via ETL to extract structured values.
- Apply null and placeholder filters during SQL generation.

---

#### **4. Evaluation Metrics Summary**

| Evaluation Metric          | Result             |
|----------------------------|--------------------|
| Query Execution Accuracy   | 100%               |
| Semantic Precision         | ~83% (2/12 flawed) |
| Translation Bottlenecks    | Present            |
| Execution Errors           | None               |

All queries executed without SQL error. Two demonstrated semantic flaws due to loose type enforcement and data quality issues, not algorithmic failure.

---

#### **5. Recommendations for Improvement**

1. **Prompt Refinement**:  
   - Add type guards for numeric thresholds.
   - Insert `IS NOT NULL` logic when querying identifiers like `BRANDS`.

2. **Data Cleansing Pipeline**:  
   - Apply a sanitization step prior to DSPy loading.
   - Flag or drop incomplete brand fields and ensure schema uniformity.

3. **Extended Test Coverage**:  
   - Evaluate DSPy on JSON operations, subqueries, filters with multiple conditions, and edge-case phrasing.

4. **Performance Optimization**:  
   - Consider compiling a distilled DSPy variant or caching templates for high-frequency queries.

5. **Post-Processing Layer**:  
   - Build an evaluation wrapper to validate query results and intercept `None`-laden rows.

---

#### **6. Forward Strategy**

To prepare for scalable deployment and advanced research evaluation:

- Version output logs and module builds for reproducibility.
- Integrate regression tracking between unoptimized and optimized module runs.
- Benchmark on PostgreSQL with larger synthetic or real transaction datasets for production-simulated conditions.
- Add live parameter validation hooks for production-facing applications.

