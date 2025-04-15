import os

# Determine project root and data directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

# Common Schemas and Indexes (can be customized per step)
GEOJSON_SCHEMA = {
    "shape_id": "VARCHAR(50)",
    "shape_name": "VARCHAR(100)",
    "shape_iso": "VARCHAR(10)",
    "shape_group": "VARCHAR(50)",
    "admin_level": "VARCHAR(10)",
    "geom": "geometry(Geometry,4326)"  # Assuming PostGIS geometry type
}
GEOJSON_INDEXES = [
    {"name": "idx_{table_name}_shape_id", "columns": "shape_id"},
    {"name": "idx_{table_name}_admin_level", "columns": "admin_level"},
    {"name": "idx_{table_name}_geom", "columns": "geom", "type": "GIST"} # Specify GIST index for geometry
]

ACLED_SCHEMA = {
    "data_id": "VARCHAR(20)",
    "event_date": "DATE",
    "event_type": "VARCHAR(50)",
    "sub_event_type": "VARCHAR(50)",
    "actor1": "VARCHAR(100)",
    "actor2": "VARCHAR(100)",
    "location": "VARCHAR(100)",
    "latitude": "DOUBLE PRECISION",
    "longitude": "DOUBLE PRECISION",
    "fatalities": "INTEGER",
    "notes": "TEXT",
    "source": "VARCHAR(100)",
    "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
}
ACLED_INDEXES = [
    {"name": "idx_{table_name}_date", "columns": "event_date"},
    {"name": "idx_{table_name}_type", "columns": "event_type"},
    {"name": "idx_{table_name}_location", "columns": "location"},
    # Example spatial index (requires lat/lon columns)
    # {"name": "idx_{table_name}_spatial", "columns": "longitude, latitude", "type": "GIST"} # Example PostGIS spatial index
]

VIIRS_SCHEMA = {
    "latitude": "DOUBLE PRECISION",
    "longitude": "DOUBLE PRECISION",
    "bright_ti4": "DOUBLE PRECISION",
    "bright_ti5": "DOUBLE PRECISION",
    "frp": "DOUBLE PRECISION",
    "acq_time": "INTEGER",
    "satellite": "VARCHAR(1)",
    "instrument": "VARCHAR(10)",
    "confidence": "CHAR(1)",
    "daynight": "CHAR(1)",
    "event_date": "DATE", # Assuming VIIRS data includes a date field
    "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
}
VIIRS_INDEXES = [
    {"name": "idx_{table_name}_temporal", "columns": "event_date, acq_time"},
    {"name": "idx_{table_name}_spatial", "columns": "latitude, longitude"},
    {"name": "idx_{table_name}_spatiotemporal", "columns": "event_date, latitude, longitude"},
    {"name": "idx_{table_name}_confidence", "columns": "confidence"}
]


# Pipeline Steps Configuration
PIPELINE_CONFIG = {
    "data_dir": DATA_DIR,
    "steps": [
        {
            "name": "Process VIIRS Data",
            "processor": "viirs",
            "params": {
                "input_file": "viirs_ukraine_cleaned.json", # Assuming cleaned input, or provide CSV
                # "input_file": "viirs_ukraine_raw.csv", 
                "table_name": "viirs_data",
                "schema": VIIRS_SCHEMA,
                "indexes": VIIRS_INDEXES,
                "fields_to_remove": ['country_id', 'scan', 'track', 'version', 'type'], # Fields to remove during cleaning
                "filter_conditions": {'confidence': 'l'} # Conditions to filter records
                # "output_file": "viirs_processed.json" # Optional: specify output path for cleaned file
            }
        },
        {
            "name": "Process Admin Boundaries",
            "processor": "geojson",
            "params": {
                "geojson_file": "geoBoundaries-UKR-ADM1_simplified.geojson",
                "table_name": "admin_boundaries",
                "schema": GEOJSON_SCHEMA,
                "indexes": GEOJSON_INDEXES,
                "admin_level": "ADM1",
                # Optional: specify GeoJSON property names if different from defaults
                # "id_field": "shapeID", 
                # "name_field": "shapeName",
                # "iso_field": "shapeISO",
                # "group_field": "shapeGroup"
            }
        },
        {
            "name": "Process ACLED Explosions",
            "processor": "acled",
            "params": {
                "input_file": "ukraine_explosions_cleaned.json", # Assuming cleaned CSV or JSON
                # "input_file": "acled_ukraine_raw.csv",
                "table_name": "acled_explosions",
                "schema": ACLED_SCHEMA,
                "indexes": ACLED_INDEXES,
                "event_type": "Explosions/Remote violence", # Filter for specific event type
                "start_date": "2022-01-01" # Optional start date filter
                # "end_date": "2023-12-31" # Optional end date filter
            }
        },
        # Add more steps here, e.g., another ACLED type
        # {
        #     "name": "Process ACLED Battles",
        #     "processor": "acled",
        #     "params": {
        #         "input_file": "ukraine_battles_cleaned.json", 
        #         "table_name": "acled_battles",
        #         "schema": ACLED_SCHEMA,
        #         "indexes": ACLED_INDEXES,
        #         "event_type": "Battles",
        #         "start_date": "2022-01-01"
        #     }
        # },
    ]
}

def get_pipeline_config() -> dict:
    """Returns the pipeline configuration."""
    # Format index names dynamically based on table name
    for step in PIPELINE_CONFIG['steps']:
        if 'indexes' in step['params'] and 'table_name' in step['params']:
            table_name = step['params']['table_name']
            for index in step['params']['indexes']:
                if 'name' in index and '{table_name}' in index['name']:
                    index['name'] = index['name'].format(table_name=table_name)
    return PIPELINE_CONFIG 