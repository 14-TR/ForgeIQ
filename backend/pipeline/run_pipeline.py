import sys
import os

# Remove sys.path manipulation
# backend_dir = os.path.dirname(os.path.abspath(__file__))
# sys.path.append(os.path.dirname(backend_dir))

# Use relative imports
from .data_pipeline import DataPipeline
from .config import get_pipeline_config
from .utils import setup_logger

def main():
    logger = setup_logger(__name__)
    logger.info("--- Starting Pipeline Execution ---")
    
    try:
        # Load configuration
        config = get_pipeline_config()
        logger.info(f"Loaded pipeline configuration with {len(config.get('steps', []))} steps.")
        logger.info(f"Using data directory: {config.get('data_dir')}")
        
        # Create and run the pipeline orchestrator
        pipeline = DataPipeline(config)
        pipeline.run()
        
        logger.info("--- Pipeline Execution Finished Successfully ---")
        
    except Exception as e:
        logger.error(f"--- Pipeline Execution Failed --- Error: {str(e)}")
        # Optionally re-raise the exception if you want the script to exit with an error code
        # raise e 

if __name__ == "__main__":
    main() 