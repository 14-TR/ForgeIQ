# Third-party imports
import psycopg2
from psycopg2.extras import RealDictCursor

# Local application imports
# from aws_secret_mgt import AWSSecretManager  # OLD WAY
from shared.secrets.aws_secret_mgt import AWSSecretManager # Get credentials from AWS

class DBConnection:
    def __init__(self):
        secret_manager = AWSSecretManager()
        self.db_config = secret_manager.get_db_credentials()  # Fetch credentials internally
        if not self.db_config:
            raise RuntimeError("❌ Failed to retrieve database credentials.")

    def __enter__(self):
        self.conn = psycopg2.connect(
            host=self.db_config["host"],
            database=self.db_config["database"],
            user=self.db_config["user"],
            password=self.db_config["password"],
            port=self.db_config["port"],
            cursor_factory=RealDictCursor
        )
        return self.conn

    def __exit__(self, exc_type, exc_value, traceback):
        self.conn.close()
