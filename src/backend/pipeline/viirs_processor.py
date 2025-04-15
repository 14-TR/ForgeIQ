import os
import json
from typing import Dict, List, Any, Optional
from .utils import setup_logger, get_full_path, csv_to_json, clean_json
from .json_to_db import JsonToDatabase

class ViirsProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.logger = setup_logger(__name__)

    def process(
        self,
        input_file: str,
        table_name: str,
        schema: Dict[str, str],
        indexes: List[Dict[str, Any]],
        fields_to_remove: List[str],
        filter_conditions: Optional[Dict[str, Any]] = None,
        output_file: Optional[str] = None
    ) -> None:
        """Process VIIRS data (CSV or JSON) and load it into the database"""
        try:
            input_path = get_full_path(self.data_dir, input_file)
            self.logger.info(f"Processing VIIRS file: {input_path}")

            # Handle potential CSV input
            if input_path.lower().endswith('.csv'):
                json_file_path = input_path.rsplit('.', 1)[0] + '.json'
                csv_to_json(input_path, json_file_path, self.logger)
                current_file_to_process = json_file_path
            elif input_path.lower().endswith('.json'):
                current_file_to_process = input_path
            else:
                raise ValueError(f"Unsupported input file format for VIIRS: {input_file}. Expecting CSV or JSON.")

            # Clean the JSON data
            cleaned_output_path = output_file or current_file_to_process.replace('.json', '_cleaned.json')
            if not os.path.isabs(cleaned_output_path):
                cleaned_output_path = get_full_path(self.data_dir, cleaned_output_path)
                
            clean_json(
                input_path=current_file_to_process,
                output_path=cleaned_output_path,
                fields_to_remove=fields_to_remove,
                filter_conditions=filter_conditions,
                logger=self.logger
            )

            # Load cleaned data to database
            converter = JsonToDatabase(
                table_name=table_name,
                schema_mapping=schema,
                indexes=indexes
            )
            converter.load_json_to_db(cleaned_output_path)

            # Optional: Clean up intermediate JSON file if CSV was input
            if input_path.lower().endswith('.csv') and os.path.exists(current_file_to_process):
                try:
                    os.remove(current_file_to_process)
                    self.logger.info(f"Removed intermediate JSON file: {current_file_to_process}")
                except OSError as e:
                    self.logger.warning(f"Could not remove intermediate JSON file {current_file_to_process}: {e}")
            
            # Optional: Clean up cleaned JSON file (can be kept for debugging)
            # Consider adding a config option to keep/remove this
            # if os.path.exists(cleaned_output_path):
            #     try:
            #         os.remove(cleaned_output_path)
            #         self.logger.info(f"Removed cleaned JSON file: {cleaned_output_path}")
            #     except OSError as e:
            #         self.logger.warning(f"Could not remove cleaned JSON file {cleaned_output_path}: {e}")

            self.logger.info(f"Successfully processed and loaded VIIRS data into table '{table_name}'")

        except Exception as e:
            self.logger.error(f"Error processing VIIRS data: {str(e)}")
            # Clean up intermediate/cleaned files on error
            files_to_clean = []
            if 'current_file_to_process' in locals() and input_path.lower().endswith('.csv'):
                files_to_clean.append(current_file_to_process)
            if 'cleaned_output_path' in locals():
                files_to_clean.append(cleaned_output_path)
                
            for f_path in files_to_clean:
                if os.path.exists(f_path):
                    try:
                        os.remove(f_path)
                        self.logger.info(f"Cleaned up file {f_path} after error.")
                    except OSError as rm_err:
                        self.logger.error(f"Error removing file {f_path} after error: {rm_err}")
            raise 