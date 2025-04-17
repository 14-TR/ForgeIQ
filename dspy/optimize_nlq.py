import dspy
import os
import sys
import traceback

# Add project root to path for shared modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Add the dspy directory itself to the path for local imports
dspy_dir = os.path.dirname(__file__)
sys.path.insert(0, dspy_dir) 

# Import necessary components
from shared.secrets.aws_secret_mgt import AWSSecretManager # For API Key
# from shared.config.aws_config import AWSConfig         # For AWS Config if needed
from nlq_to_sql import NLQtoSQL # Import from this directory
from training_data import trainset # Import trainset (needs user update!)

# --- Define the Validation Metric --- 
def validate_sql_params(example, pred, trace=None):
    """Checks if the predicted SQL template and parameters match the example.
       Uses case-insensitive comparison for template and checks parameter list equality.
       Requires example and prediction to use %s placeholders.
    """
    template_match = False
    params_match = False
    
    # Validate prediction structure
    if not hasattr(pred, 'sql_template') or not hasattr(pred, 'sql_params'):
        print("Validation Error: Prediction object missing sql_template or sql_params.")
        if trace is not None:
            # You can add more detailed tracing info if needed
            pass 
        return False # Or score 0.0 for optimizer
        
    pred_template = pred.sql_template
    pred_params = pred.sql_params

    # Validate example structure (less critical but good practice)
    if not hasattr(example, 'sql_template') or not hasattr(example, 'sql_params'):
        print("Validation Error: Example object missing sql_template or sql_params.")
        return False
        
    # --- Template Comparison (Case-insensitive, ignore whitespace) --- 
    if isinstance(pred_template, str) and isinstance(example.sql_template, str):
        template_match = example.sql_template.strip().lower() == pred_template.strip().lower()
    else:
        # Handle cases where one or both might be None
        template_match = example.sql_template == pred_template # Checks if both are None

    # --- Parameters Comparison (Order matters, must be lists) --- 
    # Ensure both are lists before comparing
    example_params = example.sql_params if isinstance(example.sql_params, list) else []
    # Handle potential non-list prediction params (should have been caught by NLQtoSQL parsing)
    pred_params_list = pred_params if isinstance(pred_params, list) else [] 
    
    params_match = example_params == pred_params_list
    
    # --- Logging for Debugging --- 
    if not (template_match and params_match):
        print("--- Validation Failed ---")
        print(f"Question: {getattr(example, 'question', 'N/A')}")
        print(f"Expected Template: {example.sql_template}")
        print(f"Predicted Template: {pred_template} (Match: {template_match})")
        print(f"Expected Params:   {example_params}")
        print(f"Predicted Params:  {pred_params_list} (Match: {params_match})")
        print("-------------------------")
        
    # --- Return Value --- 
    final_match = template_match and params_match
    if trace is None: # Simple pass/fail metric
        # For simple pass/fail, we still need exact match
        return final_match
    else: # Detailed trace for optimization with partial scores
        score = 0.0
        if template_match and params_match:
            score = 1.0
        elif template_match: # Template matches, params don't
            score = 0.6 
        elif params_match: # Params match, template doesn't
            score = 0.3 
            
        # Optionally add feedback to the trace
        trace.append(f"Template Match: {template_match}, Params Match: {params_match}, Score: {score:.1f}")
        return score

# --- Configure DSPy LM (using GPT-3.5-turbo for optimization) --- 
print("Configuring DSPy Language Model for Optimization (GPT-3.5-turbo)...")
openai_api_key = None
try:
    secret_manager = AWSSecretManager()
    openai_api_key = secret_manager.get_openai_api_key()
    if not openai_api_key:
         raise ValueError("Retrieved API key is empty.")
    print("OpenAI API key retrieved successfully.")
except Exception as e:
    print(f"Error getting OpenAI key from AWS: {e}")
    print(f"Full traceback: {traceback.format_exc()}")
    print("Ensure AWS credentials are configured and the secret exists.")
    exit(1)

try:
    # Use a potentially cheaper/faster model for optimization
    print("Configuring optimizer LLM (GPT-4o)...")
    llm_optimizer = dspy.LM(
        model='gpt-4o', # Use the more powerful model for optimization too
        api_key=openai_api_key, 
        max_tokens=350, # Allow slightly more tokens for complex generation + reasoning during optimization
        temperature=0.0 # Keep deterministic for optimization
    )
    dspy.configure(lm=llm_optimizer)
    print("DSPy LM configured successfully for optimization.")
except Exception as e:
    print(f"Error configuring DSPy LM for optimization: {e}")
    print(f"Full traceback: {traceback.format_exc()}")
    exit(1)

# --- Check Training Data --- 
if not trainset:
    print("Error: Training data is empty. Please populate dspy/training_data.py with examples relevant to your schema.")
    exit(1)
else:
     print(f"Found {len(trainset)} examples in the training set.")
     print("Reminder: Ensure these examples match your actual DB schema and use %s placeholders.")

# --- Setup the Optimizer (Teleprompter) --- 
from dspy.teleprompt import BootstrapFewShot

# Configure the BootstrapFewShot optimizer
# It will try to build few-shot prompts for our NLQtoSQL module using the metric
# max_bootstrapped_demos: Examples from trainset used to propose prompts
# max_labeled_demos: Examples from trainset used in the final prompt
# --- TEMPORARILY SIMPLIFYING CONFIG FOR DEBUGGING ---
config = dict(max_bootstrapped_demos=4, max_labeled_demos=4) # Restore original config
# config = dict(max_bootstrapped_demos=1, max_labeled_demos=1) 
print(f"Initializing BootstrapFewShot teleprompter with config: {config}")
teleprompter = BootstrapFewShot(metric=validate_sql_params, **config)

# --- Run the Compilation --- 
print(f"Starting compilation with {len(trainset)} training examples...")
print("(This might take a while depending on the number of examples and LLM speed...)")

# Ensure the base module is instantiated correctly
# NLQtoSQL fetches schema internally, so no need to pass args here usually
uncompiled_program = NLQtoSQL()

# --- TEMPORARY DEBUGGING: Run forward pass manually for problematic query --- 
# print("\n--- Running manual forward pass for debugging ---")
# try:
#     debug_question = "Show battle details for all of 2024"
#     print(f"DEBUG: Calling forward pass for: '{debug_question}'")
#     # Ensure dspy LM is configured before this call
#     debug_prediction = uncompiled_program.forward(debug_question)
#     print(f"DEBUG: Prediction object received:")
#     print(debug_prediction)
#     print(f"DEBUG: Type of prediction: {type(debug_prediction)}")
#     print(f"DEBUG: Has sql_template: {hasattr(debug_prediction, 'sql_template')}")
#     print(f"DEBUG: Has sql_params: {hasattr(debug_prediction, 'sql_params')}")
# except Exception as debug_e:
#     print(f"DEBUG: Error during manual forward pass: {debug_e}")
#     traceback.print_exc() # Print full traceback for the debug call
# print("--- End manual forward pass debug ---\n")
# --- END TEMPORARY DEBUGGING --- 

try:
    # Optimize the NLQtoSQL program using the training set
    # The compile method calls the program's forward pass, which triggers schema fetching if needed
    optimized_nlq = teleprompter.compile(uncompiled_program, trainset=trainset)
    print("Compilation finished successfully.")
except Exception as e:
     print(f"\nError during DSPy compilation: {e}")
     print(f"Full traceback: {traceback.format_exc()}")
     print("\nPossible issues:")
     print("- Ensure training data in 'dspy/training_data.py' is correct for your schema and uses %s placeholders.")
     print("- Check if the FastAPI schema endpoint is running and accessible.")
     print("- Verify API key validity and LLM configuration.")
     print("- Potential issues with the validation metric or the structure of examples/predictions.")
     exit(1)

# --- Save the Optimized Module --- 
save_path = "dspy/optimized_nlq_module.json"
print(f"Saving optimized module to {save_path}...")
try:
    optimized_nlq.save(save_path)
    print("Optimized module saved successfully.") 
except Exception as e:
     print(f"\nError saving the optimized module to {save_path}: {e}")
     print(f"Full traceback: {traceback.format_exc()}")
     exit(1)

print("\nOptimization complete. You can now use the optimized module in 'dspy/run_queries.py'.") 