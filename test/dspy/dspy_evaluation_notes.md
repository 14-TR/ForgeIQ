# **Init Testing**: DSPy 
**DATE**: 04/09/2025

### **NLQ-to-SQL Performance Evaluation via DSPy**

#### **System Context and Setup**

- **LLM Provider**: OpenAI, configured securely through AWS Secrets Manager.
- **Module Used**: DSPy in unoptimized mode; optimized variant not yet compiled.
- **Database**: SQLite, local deployment, single table: `transactions`.
- **File Source**: `sample.csv`, loaded successfully with expected schema.

Translation and execution times were isolated per query to enable fine-grained evaluation of both the NLP layer (DSPy) and the SQL engine (SQLite).

---

#### **1. Semantic Fidelity Evaluation**

**Accurate and Fully Aligned Queries**

The following queries were parsed and executed correctly with accurate SQL and expected results:

- `Show all data for the brand 'Wingstop'`
- `What is the total spend for Subway?`
- `Show the brand and number of customers for Domino's Pizza`
- `List all unique brands`
- `Which 5 brands had the highest total spend?`
- `What is the average total spend per brand?`
- `Show data for brands containing the word 'Pizza'`

These represent successful one-to-one mappings from NLQ to SQL, with correct use of `LIKE`, `GROUP BY`, `ORDER BY`, and aggregate functions.

---

**Partial Failures / Semantic Drift**

- **Query**: `List brands with more than 500 transactions`
  - **Issue**: Parameter parsing failed. `['500']` was not properly interpreted as a numeric value.
  - **Result**: Empty `sql_params`, leading to execution error due to missing binding.
  - **Recommendation**: Parser module should enforce numeric coercion and validate parameter length before execution.

- **Query**: `Which named brand had the lowest total spend?`
  - **Issue**: Results included rows with `BRANDS = None`.
  - **Consequence**: Aggregate outputs were skewed by non-informative brand labels.
  - **Recommendation**: Augment SQL generation to include null filters:  
    `WHERE BRANDS IS NOT NULL AND BRANDS != 'None'`

---

#### **2. Performance Evaluation: Translation vs Execution**

| Metric                | Mean Time (Seconds) |
|-----------------------|---------------------|
| NLQ Translation Time  | 2.14                |
| SQL Execution Time    | 0.00017             |

**Conclusion**: The primary computational overhead lies in DSPy’s translation phase, not database execution. SQLite performance is optimal. System-wide optimization should focus on reducing translation latency, potentially through compiling the optimized module.

---

#### **3. Data Integrity Observations**

- **Placeholder Labels (e.g., 'None')** appear in brand fields and exhibit high aggregate values.
- **Impact**: These distort outputs of queries using `SUM`, `AVG`, or `ORDER BY`.
- **Recommendation**: Clean dataset to eliminate or standardize such placeholders prior to analysis.

---

#### **4. Evaluation Metrics Summary**

| Evaluation Metric          | Result             |
|----------------------------|--------------------|
| Query Execution Accuracy   | ~92% (11/12)       |
| Semantic Precision         | ~83% (2/12 flawed) |
| Translation Bottlenecks    | Present            |
| Execution Errors           | 1 query            |

DSPy demonstrated high effectiveness on structurally simple queries but failed in parameter binding under conditions involving numeric thresholds.

---

#### **5. Recommendations for Improvement**

1. **Optimize Model**: Run `optimize_nlq.py` to compile the optimized DSPy module.
2. **Parser Hardening**: Ensure all numeric and boolean values are coercible and validated.
3. **Data Cleansing**: Remove or reclassify `None` and similar placeholders in critical fields.
4. **Extended Test Suite**: Develop NLQ test cases covering:
   - Nested queries
   - JSON field operations
   - Filter chaining with complex conditions
5. **Execution Guardrails**: Integrate pre-execution validation to intercept malformed param arrays.

---

#### **6. Forward Strategy**

To maintain research-grade reproducibility and scalability:
- Implement a versioned logging system for NLQ → SQL translation and execution metadata.
- Incorporate automated regression tests for each DSPy module build.
- Consider porting from SQLite to PostgreSQL for real-world deployment scenarios with larger-scale transactional data.

---

Let me know if you'd like a formal template for ongoing benchmark reporting or an automated script to reproduce these diagnostics across environments.