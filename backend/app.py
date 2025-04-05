# Standard library imports
from decimal import Decimal
from typing import List, Optional

# Third-party imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Local application imports
# from aws_secret_mgt import get_db_credentials  # Assuming this is correctly located/managed
from shared.secrets.aws_secret_mgt import get_db_credentials # Corrected import path
from db.execute_query import execute_query
# from db_connect import DBConnection # Removed as unused
from nlq.clean_query import clean_query
from nlq.openai_query import openai_query
from nlq.validate_query import validate_query

# Initialize FastAPI
app = FastAPI()

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://cm-react-app.s3-website.us-east-2.amazonaws.com",  # Your S3 website
        "https://cm-react-app.s3-website.us-east-2.amazonaws.com",  # HTTPS version
        "http://localhost:5173",  # Local development
        "http://127.0.0.1:5173",  # Local development alternative
        "http://18.218.227.30:8000",  # Your EC2 instance
        "*"  # Temporarily allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Ensure we retrieve DB credentials on startup
DB_CREDENTIALS = get_db_credentials()
if not DB_CREDENTIALS:
    raise RuntimeError("❌ Failed to retrieve database credentials.")

# Natural Language Query request model
class QueryRequest(BaseModel):
    query: str

# Event model for response clarity
class Event(BaseModel):
    event_id_cnty: str
    event_date: str
    year: int
    time_precision: Optional[int] = None
    disorder_type: Optional[str] = None
    event_type: str
    country: str
    admin1: Optional[str] = None
    admin2: Optional[str] = None
    admin3: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geo_precision: Optional[int] = None
    source: Optional[str] = None
    source_scale: Optional[str] = None
    notes: Optional[str] = None
    fatalities: Optional[int] = None

# Battles endpoint (Returns Only Last Year's Data)
@app.get("/battles", response_model=List[Event])
def get_recent_battles():
    # Query to find the most recent event date
    most_recent_date_query = "SELECT MAX(event_date) FROM battles;"
    
    try:
        df_recent = execute_query(most_recent_date_query)  
        most_recent_date = df_recent.iloc[0, 0]  # Extracts the most recent date
        
        if not most_recent_date:
            raise HTTPException(status_code=404, detail="No data found.")

        # Extract the year from the most recent date
        most_recent_year = most_recent_date.year

        # Query to fetch battles only from the last year of the most recent event
        query = f"""
            SELECT event_id_cnty, event_date::TEXT, year, time_precision, disorder_type, event_type,
                   country, admin1, admin2, admin3, location, latitude, longitude, geo_precision,
                   source, source_scale, notes, fatalities
            FROM battles
            WHERE year = {most_recent_year}  -- Filter by the most recent year
            ORDER BY event_date DESC;
        """

        df_result = execute_query(query)
        return df_result.to_dict(orient="records") if not df_result.empty else []
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")


@app.get("/explosions", response_model=List[Event])
def get_explosions():
    try:
        query = """
            SELECT event_id_cnty, event_date::TEXT, year, time_precision, disorder_type, event_type,
                   country, admin1, admin2, admin3, location, latitude, longitude, geo_precision,
                   source, source_scale, notes, fatalities
            FROM explosions
            ORDER BY event_date DESC;
        """
        df_result = execute_query(query)
        return df_result.to_dict(orient="records") if not df_result.empty else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")
    

@app.get("/viirs")
def get_viirs_data():
    query = """
        SELECT latitude, longitude, bright_ti4, bright_ti5, frp, acq_time, 
               satellite, instrument, confidence, daynight, event_date::TEXT, 
               created_at::TEXT
        FROM viirs_data
        ORDER BY event_date DESC, created_at DESC;
    """

    try:
        df_result = execute_query(query)
        if df_result.empty:
            raise HTTPException(status_code=404, detail="No VIIRS data found.")

        # Return JSON-friendly output
        return df_result.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")



# Natural Language Query endpoint
@app.post("/nlq")
def process_nlq(request: QueryRequest):
    try:
        print(f"📝 Received NLQ: {request.query}")

        generated_sql = openai_query(request.query)
        print(f"🔍 Generated SQL: {generated_sql}")

        cleaned_sql = clean_query(generated_sql)
        print(f"🧹 Cleaned SQL: {cleaned_sql}")

        validate_query(cleaned_sql)

        df_result = execute_query(cleaned_sql)
        query_result = df_result.to_dict(orient="records") if not df_result.empty else []

        print(f"📡 NLQ Query Result: {query_result}")

        return query_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLQ processing error: {str(e)}")
