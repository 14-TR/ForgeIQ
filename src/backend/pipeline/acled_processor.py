import os
import json
import pandas as pd
from typing import Dict, List, Any, Optional
from .utils import setup_logger, get_full_path
from .json_to_db import JsonToDatabase

class AcledProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.logger = setup_logger(__name__)

    def process(
        self,
        input_file: str,
        table_name: str,
        schema: Dict[str, str],
        indexes: List[Dict[str, Any]],
        event_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> None:
        """Process ACLED data (CSV) and load it into the database"""
        try:
            input_path = get_full_path(self.data_dir, input_file)
            self.logger.info(f"Processing ACLED file: {input_path}")
            
            # Read CSV data using pandas
            df = pd.read_csv(input_path)
            self.logger.info(f"Read {len(df)} records from {input_file}")
            
            # Filter by date if specified
            if 'event_date' in df.columns:
                df['event_date'] = pd.to_datetime(df['event_date'])
                if start_date:
                    start_dt = pd.to_datetime(start_date)
                    df = df[df['event_date'] >= start_dt]
                    self.logger.info(f"Filtered records after {start_date}: {len(df)} remaining")
                if end_date:
                    end_dt = pd.to_datetime(end_date)
                    df = df[df['event_date'] <= end_dt]
                    self.logger.info(f"Filtered records before {end_date}: {len(df)} remaining")
            
            # Filter by event type if specified
            if event_type and 'event_type' in df.columns:
                df = df[df['event_type'] == event_type]
                self.logger.info(f"Filtered for event type '{event_type}': {len(df)} remaining")
            
            # Convert DataFrame to list of dictionaries (JSON serializable)
            # Ensure date columns are formatted correctly
            for col in df.select_dtypes(include=['datetime64[ns]']).columns:
                df[col] = df[col].dt.strftime('%Y-%m-%d') # Format date as YYYY-MM-DD string
                
            data_to_load = df.to_dict(orient='records')

            # Save processed data to temporary JSON
            temp_json = os.path.join(self.data_dir, f"temp_{table_name}.json")
            with open(temp_json, 'w') as f:
                json.dump(data_to_load, f, indent=4)
            self.logger.info(f"Saved processed ACLED data to temporary file: {temp_json}")

            # Load to database
            converter = JsonToDatabase(
                table_name=table_name,
                schema_mapping=schema,
                indexes=indexes
            )
            converter.load_json_to_db(temp_json)
            
            # Clean up temporary file
            os.remove(temp_json)
            self.logger.info(f"Removed temporary file: {temp_json}")
            self.logger.info(f"Successfully processed and loaded ACLED data into table '{table_name}'")
            
        except Exception as e:
            self.logger.error(f"Error processing ACLED data: {str(e)}")
            # Clean up temp file on error if it exists
            if 'temp_json' in locals() and os.path.exists(temp_json):
                 try:
                     os.remove(temp_json)
                     self.logger.info(f"Cleaned up temporary file {temp_json} after error.")
                 except OSError as rm_err:
                     self.logger.error(f"Error removing temporary file {temp_json} after error: {rm_err}")
            raise 