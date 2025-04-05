import sys
import os

# Add the parent directory (backend) to the Python path
# This allows importing from sibling directories like 'db'
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(backend_dir))

# Now import from the pipeline package
from pipeline.data_pipeline import DataPipeline
from pipeline.config import get_pipeline_config
from pipeline.utils import setup_logger

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