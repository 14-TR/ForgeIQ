import openai
from aws_secret_mgt import get_openai_api_key

# Retrieve OpenAI API key securely
api_key = get_openai_api_key()

if not api_key:
    raise Exception("❌ OpenAI API key not found!")

# Initialize OpenAI Client
CLIENT = openai.OpenAI(api_key=api_key)

print("✅ OpenAI Client initialized successfully!")
