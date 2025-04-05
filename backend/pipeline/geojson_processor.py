import os
import json
import geopandas as gpd
from typing import Dict, List, Any, Optional
from .utils import setup_logger, get_full_path
from .json_to_db import JsonToDatabase

class GeoJsonProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.logger = setup_logger(__name__)

    def process(
        self,
        geojson_file: str,
        table_name: str,
        schema: Dict[str, str],
        indexes: List[Dict[str, Any]],
        admin_level: Optional[str] = None,
        id_field: str = "shapeID",
        name_field: str = "shapeName",
        iso_field: str = "shapeISO",
        group_field: str = "shapeGroup"
    ) -> None:
        """Process GeoJSON data and load it into the database"""
        try:
            geojson_path = get_full_path(self.data_dir, geojson_file)
            self.logger.info(f"Processing GeoJSON file: {geojson_path}")
            
            # Read GeoJSON using geopandas
            gdf = gpd.read_file(geojson_path)
            
            # Process the data
            processed_data = []
            for _, row in gdf.iterrows():
                processed_entry = {
                    "shape_id": row.get(id_field, ""),
                    "shape_name": row.get(name_field, ""),
                    "shape_iso": row.get(iso_field, ""),
                    "shape_group": row.get(group_field, ""),
                    "admin_level": admin_level or row.get("admin_level", ""),
                    "geom": row.geometry.wkt  # Store geometry as WKT string
                }
                processed_data.append(processed_entry)
            
            # Save processed data to temporary JSON
            temp_json = os.path.join(self.data_dir, f"temp_{table_name}.json")
            with open(temp_json, 'w') as f:
                json.dump(processed_data, f)
            self.logger.info(f"Saved processed GeoJSON data to temporary file: {temp_json}")
            
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
            self.logger.info(f"Successfully processed and loaded GeoJSON data into table '{table_name}'")
            
        except Exception as e:
            self.logger.error(f"Error processing GeoJSON data: {str(e)}")
            # Clean up temp file on error if it exists
            if 'temp_json' in locals() and os.path.exists(temp_json):
                 try:
                     os.remove(temp_json)
                     self.logger.info(f"Cleaned up temporary file {temp_json} after error.")
                 except OSError as rm_err:
                     self.logger.error(f"Error removing temporary file {temp_json} after error: {rm_err}")
            raise 