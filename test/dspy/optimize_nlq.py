import dspy
import os
import sys

# Add project root to path for shared modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# Add the dspy directory itself to the path for local imports
dspy_dir = os.path.dirname(__file__)
sys.path.insert(0, dspy_dir) 

# Import necessary components
from shared.secrets.aws_secret_mgt import AWSSecretManager # For API Key
from shared.config.aws_config import AWSConfig         # For AWS Config if needed
# Import directly now that the directory is in the path
from nlq_to_sql import NLQtoSQL              
from training_data import trainset, devset 

# --- Define the Validation Metric --- 
def validate_sql_params(example, pred, trace=None):
    """Checks if the predicted SQL template and parameters exactly match the example."""
    # Check template match (case-insensitive, ignore minor whitespace)
    template_match = example.sql_template.strip().lower() == pred.sql_template.strip().lower()
    
    # Check parameters match (order matters)
    # Ensure both are lists before comparing
    example_params = example.sql_params if isinstance(example.sql_params, list) else []
    pred_params = pred.sql_params if isinstance(pred.sql_params, list) else []
    params_match = example_params == pred_params
    
    if trace is None: # Simple pass/fail metric
        return template_match and params_match
    else: # Detailed trace for optimization
        # Returning a score (1.0 for perfect match, 0.0 otherwise)
        # Could be refined later (e.g., partial score for template match)
        score = 1.0 if (template_match and params_match) else 0.0
        # Optionally add feedback to the trace
        # trace.append(f"Template Match: {template_match}, Params Match: {params_match}")
        return score

# --- Configure DSPy LM --- 
print("Configuring DSPy Language Model...")
openai_api_key = None
try:
    secret_manager = AWSSecretManager()
    openai_api_key = secret_manager.get_openai_api_key()
except Exception as e:
    print(f"Error getting OpenAI key from AWS: {e}")
    print("Ensure AWS credentials are configured.")
    exit(1)

if not openai_api_key:
    print("Error: OpenAI API key not found via AWS Secrets Manager.")
    exit(1)

try:
    # Using the LM configuration consistent with test_nlq_sql.py
    llm = dspy.LM(
        model='gpt-3.5-turbo', 
        api_key=openai_api_key, 
        max_tokens=150, 
        temperature=0.0 # Keep deterministic for optimization
    )
    dspy.configure(lm=llm)
    print("DSPy LM configured successfully.")
except Exception as e:
    print(f"Error configuring DSPy LM: {e}")
    exit(1)

# --- Setup the Optimizer (Teleprompter) --- 
from dspy.teleprompt import BootstrapFewShot

# Configure the BootstrapFewShot optimizer
# It will try to build few-shot prompts for our NLQtoSQL module using the metric
config = dict(max_bootstrapped_demos=4, max_labeled_demos=4)
teleprompter = BootstrapFewShot(metric=validate_sql_params, **config)

# --- Run the Compilation --- 
print(f"Starting compilation with {len(trainset)} training examples...")
# Optimize the NLQtoSQL program
# Removed devset argument as it's not expected by this compile method
optimized_nlq = teleprompter.compile(NLQtoSQL(), trainset=trainset)
print("Compilation finished.")

# --- Save the Optimized Module --- 
save_path = "test/dspy/optimized_nlq_module.json"
print(f"Saving optimized module to {save_path}...")
optimized_nlq.save(save_path)
print("Optimized module saved successfully.") 