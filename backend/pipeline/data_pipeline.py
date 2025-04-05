import json
import csv
from typing import Dict, List, Any, Optional, Union
import logging
import os
import sys
import geopandas as gpd
from shapely.geometry import shape
import pandas as pd
from datetime import datetime

# Add parent directory to Python path for db_connect
# This might need adjustment depending on your final project structure
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .config import get_pipeline_config
from .utils import setup_logger
from .geojson_processor import GeoJsonProcessor
from .acled_processor import AcledProcessor
from .viirs_processor import ViirsProcessor

class DataPipeline:
    def __init__(self, config: Dict[str, Any]):
        """Initialize the data pipeline orchestrator with configuration."""
        self.config = config
        self.data_dir = config.get('data_dir')
        if not self.data_dir:
            raise ValueError("Configuration must include 'data_dir'")
            
        self.logger = setup_logger(__name__)
        self.processors = self._initialize_processors()

    def _initialize_processors(self) -> Dict[str, Any]:
        """Initialize processor instances based on unique types in config."""
        processor_classes = {
            "geojson": GeoJsonProcessor,
            "acled": AcledProcessor,
            "viirs": ViirsProcessor,
            # Add mappings for other processor types here
        }
        
        initialized_processors = {}
        # Determine unique processor types needed from the config
        required_processor_types = set(step['processor'] for step in self.config.get('steps', []))
        
        for processor_type in required_processor_types:
            if processor_type in processor_classes:
                self.logger.info(f"Initializing processor: {processor_type}")
                initialized_processors[processor_type] = processor_classes[processor_type](self.data_dir)
            else:
                self.logger.warning(f"Unknown processor type specified in config: {processor_type}. Skipping.")
        
        return initialized_processors

    def run(self) -> None:
        """Run the data pipeline based on the configuration steps."""
        self.logger.info("Starting data pipeline run...")
        steps = self.config.get('steps', [])
        
        if not steps:
            self.logger.warning("No steps defined in the pipeline configuration.")
            return

        for i, step in enumerate(steps):
            step_name = step.get('name', f"Step {i+1}")
            processor_type = step.get('processor')
            params = step.get('params', {})
            
            self.logger.info(f"--- Running Step {i+1}: {step_name} ({processor_type}) ---")
            
            if processor_type not in self.processors:
                self.logger.error(f"Processor type '{processor_type}' for step '{step_name}' not initialized or unknown. Skipping step.")
                continue
                
            processor_instance = self.processors[processor_type]
            
            try:
                # Pass parameters to the processor's process method
                processor_instance.process(**params)
                self.logger.info(f"--- Completed Step {i+1}: {step_name} ---")
            except Exception as e:
                self.logger.error(f"--- Failed Step {i+1}: {step_name} --- Error: {str(e)}")
                # Decide on error handling: stop pipeline or continue? 
                # Currently continues, but you might want to raise e to stop.
                # raise e 
        
        self.logger.info("Data pipeline run finished.")

# The main execution block is now moved to run_pipeline.py
# if __name__ == "__main__":
#     config = get_pipeline_config()
#     pipeline = DataPipeline(config)
#     pipeline.run() 