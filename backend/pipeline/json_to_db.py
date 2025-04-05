import json
import psycopg2
from psycopg2.extras import execute_values, RealDictCursor
from typing import Dict, List, Any, Optional
import logging
from db_connect import DBConnection
from .utils import setup_logger

class JsonToDatabase:
    def __init__(
        self,
        table_name: str,
        schema_mapping: Dict[str, str],
        indexes: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Initialize the JSON to Database converter
        
        Args:
            table_name: Name of the table to create/insert into
            schema_mapping: Dictionary mapping field names to their SQL types
            indexes: List of dictionaries containing index definitions
        """
        self.table_name = table_name
        self.schema_mapping = schema_mapping
        self.indexes = indexes or []
        self.logger = setup_logger(__name__)

    def create_table(self, conn) -> None:
        """Create the table if it doesn't exist"""
        fields = [f"{field} {dtype}" for field, dtype in self.schema_mapping.items()]
        create_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {self.table_name} (
            {', '.join(fields)}
        );
        """
        
        with conn.cursor() as cur:
            self.logger.info(f"Creating table {self.table_name}")
            cur.execute(create_table_sql)
            
            # Create indexes
            for index in self.indexes:
                index_name = index.get('name', f"idx_{self.table_name}_{index['columns'].replace(', ', '_')}")
                using_clause = f" USING {index['type']}" if 'type' in index else ""
                index_sql = f"""
                CREATE INDEX IF NOT EXISTS {index_name} 
                ON {self.table_name}{using_clause} ({index['columns']});
                """
                self.logger.info(f"Creating index {index_name}")
                cur.execute(index_sql)
            
            conn.commit()

    def load_json_to_db(self, json_file_path: str, batch_size: int = 1000) -> None:
        """Load JSON data into the database"""
        try:
            # Read JSON data
            with open(json_file_path, 'r') as file:
                data = json.load(file)

            # Connect to database using the centralized connection manager
            with DBConnection() as conn:
                # Create table and indexes
                self.create_table(conn)

                # Prepare data for insertion
                fields = list(self.schema_mapping.keys())
                
                # Insert data in batches
                with conn.cursor() as cur:
                    for i in range(0, len(data), batch_size):
                        batch = data[i:i + batch_size]
                        values = [[record.get(field) for field in fields] for record in batch]
                        
                        insert_sql = f"""
                        INSERT INTO {self.table_name} ({', '.join(fields)})
                        VALUES %s
                        """
                        
                        execute_values(cur, insert_sql, values)
                        conn.commit()
                        self.logger.info(f"Inserted batch of {len(batch)} records")

                self.logger.info(f"Successfully loaded {len(data)} records into {self.table_name}")

        except Exception as e:
            self.logger.error(f"Error loading data: {str(e)}")
            raise 