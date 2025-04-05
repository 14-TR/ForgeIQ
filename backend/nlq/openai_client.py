# Third-party imports
import openai

# Local application imports
# from shared.secrets.aws_secret_mgt import get_openai_api_key # OLD WAY
from shared.secrets.aws_secret_mgt import AWSSecretManager

# Retrieve OpenAI API key securely
# api_key = get_openai_api_key() # OLD WAY
secret_manager = AWSSecretManager()
api_key = secret_manager.get_openai_api_key()

if not api_key:
    raise Exception("❌ OpenAI API key not found!")

# Initialize OpenAI Client
CLIENT = openai.OpenAI(api_key=api_key)

# print("✅ OpenAI Client initialized successfully!") # Removed print statement
