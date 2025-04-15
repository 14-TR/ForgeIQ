import logging
import os
import csv
import json
from typing import Dict, List, Any, Optional

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

def get_full_path(data_dir: str, filename: str) -> str:
    """Get full path for a file in the data directory"""
    if os.path.isabs(filename):
        return filename
    return os.path.join(data_dir, filename)

def csv_to_json(csv_path: str, json_path: str, logger: logging.Logger) -> None:
    """Convert CSV file to JSON"""
    try:
        with open(csv_path, 'r') as csvfile:
            csvdata = csv.DictReader(csvfile)
            data = list(csvdata)

        with open(json_path, 'w') as jsonfile:
            json.dump(data, jsonfile, indent=4)
        
        logger.info(f"Successfully converted {os.path.basename(csv_path)} to {os.path.basename(json_path)}")
    except Exception as e:
        logger.error(f"Error converting CSV to JSON: {str(e)}")
        raise

def clean_json(
    input_path: str,
    output_path: str,
    fields_to_remove: List[str],
    logger: logging.Logger,
    filter_conditions: Optional[Dict[str, Any]] = None
) -> None:
    """Clean JSON data by removing fields and filtering records"""
    try:
        with open(input_path, 'r') as file:
            data = json.load(file)

        cleaned_data = []
        for entry in data:
            # Apply filters
            if filter_conditions:
                skip = False
                for field, value in filter_conditions.items():
                    if entry.get(field) == value:
                        skip = True
                        break
                if skip:
                    continue

            # Remove specified fields
            for field in fields_to_remove:
                entry.pop(field, None)

            cleaned_data.append(entry)

        with open(output_path, 'w') as file:
            json.dump(cleaned_data, file, indent=4)

        logger.info(f"Successfully cleaned data. Original records: {len(data)}, Cleaned records: {len(cleaned_data)}. Output: {os.path.basename(output_path)}")
    except Exception as e:
        logger.error(f"Error cleaning JSON data: {str(e)}")
        raise 