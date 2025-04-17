import dspy

# ==========================================================================================
# IMPORTANT: This training data MUST be relevant to YOUR PostgreSQL schema
#            (e.g., 'battles', 'explosions', 'viirs_data') for the optimizer to work correctly.
#            Get the correct schema by running your FastAPI server and accessing /schema.
# ==========================================================================================

# Define examples for training the NLQ->SQL module
# Each example needs a natural language question, the expected SQL query template,
# and the expected list of parameters.
# Use %s for placeholders (psycopg2 style).

# --- Resetting to the 8 specified examples --- 
trainset = [
    # Example 1: Battles in 2024
    dspy.Example(
        question="Show battle details for all of 2024",
        sql_template="SELECT event_id_cnty, event_date, admin1, location, fatalities, latitude, longitude FROM battles WHERE event_date BETWEEN %s AND %s",
        sql_params=['2024-01-01', '2024-12-31']
    ).with_inputs("question"),

    # Example 2: Battles in July 2024
    dspy.Example(
        question="Show battles in July 2024",
        sql_template="SELECT event_id_cnty, event_date, admin1, location, fatalities, latitude, longitude FROM battles WHERE event_date BETWEEN %s AND %s",
        sql_params=['2024-07-01', '2024-07-31']
    ).with_inputs("question"),

    # Example 3: Battles in July 2024, Donetsk
    dspy.Example(
        question="Show battles in Donetsk during July 2024",
        sql_template="SELECT event_id_cnty, event_date, admin1, location, fatalities, latitude, longitude FROM battles WHERE event_date BETWEEN %s AND %s AND admin1 ILIKE %s",
        sql_params=['2024-07-01', '2024-07-31', '%Donetsk%']
    ).with_inputs("question"),

    # Example 4: Battles in July 2024, NOT Donetsk
    dspy.Example(
        question="Show battles in July 2024 that were not in Donetsk",
        sql_template="SELECT event_id_cnty, event_date, admin1, location, fatalities, latitude, longitude FROM battles WHERE event_date BETWEEN %s AND %s AND admin1 <> %s",
        sql_params=['2024-07-01', '2024-07-31', 'Donetsk'] # Exact match needed for <> 
    ).with_inputs("question"),

    # Example 5: Battles near Donetsk boundary in July 2024
    dspy.Example(
        question="List battles within 50km of the Donetsk administrative boundary in July 2024",
        sql_template="SELECT b.event_id_cnty, b.event_date, b.admin1, b.location, b.latitude, b.longitude FROM battles b JOIN admin_boundaries a ON a.shape_name ILIKE %s AND ST_DWithin(b.geom::geography, a.geom::geography, %s) WHERE b.event_date BETWEEN %s AND %s",
        sql_params=['%Donetsk%', '50000', '2024-07-01', '2024-07-31']
    ).with_inputs("question"),

    # Example 6: Top 3 months for explosions in Donetsk 2024
    dspy.Example(
        question="What were the top 3 months for explosions in Donetsk during 2024?",
        sql_template="SELECT to_char(event_date, 'Mon') AS month, COUNT(*) AS explosion_count FROM explosions WHERE event_date BETWEEN %s AND %s AND admin1 ILIKE %s GROUP BY month ORDER BY explosion_count DESC LIMIT %s",
        sql_params=['2024-01-01', '2024-12-31', '%Donetsk%', '3']
    ).with_inputs("question"),

    # Example 7: High confidence VIIRS in July 2024
    dspy.Example(
        question="Show high confidence VIIRS detections in July 2024",
        sql_template="SELECT latitude, longitude, bright_ti4, acq_time, event_date FROM viirs_data WHERE confidence ILIKE %s AND event_date BETWEEN %s AND %s",
        sql_params=['%h%', '2024-07-01', '2024-07-31']
    ).with_inputs("question"),

    # Example 8: Top 5 days by VIIRS FRP within Donetsk boundary in 2024
    dspy.Example(
        question="Which 5 days had the highest total VIIRS FRP within the Donetsk boundary during 2024?",
        sql_template="SELECT v.event_date, SUM(v.frp) AS total_frp FROM viirs_data v JOIN admin_boundaries a ON ST_Intersects(ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326), a.geom) WHERE a.shape_name ILIKE %s AND v.event_date BETWEEN %s AND %s GROUP BY v.event_date ORDER BY total_frp DESC LIMIT %s",
        sql_params=['%Donetsk%', '2024-01-01', '2024-12-31', '5']
    ).with_inputs("question"),
]

# Note: Example 6 (H3 hotspots) from the original set remains commented out

# Optional: Define a development set for evaluating the optimizer (can be same as trainset initially)
# devset = [
#     # ... copy relevant examples from trainset or add new ones ...
# ]
# print(f"Loaded {len(devset)} development examples.") # Uncomment if using devset 

print(f"Loaded {len(trainset)} specified training examples for NLQ->SQL.")