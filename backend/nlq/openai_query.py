# Local application imports
from .openai_client import CLIENT
from .prompt_config import PROMPT  # Import system prompt

def openai_query(user_prompt):
    response = CLIENT.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": str(PROMPT)
            },
            {
                "role": "user",
                "content": str(user_prompt)
            }
        ],
        temperature=0.0,
        max_tokens=1024,
        top_p=1
    )

    return response.choices[0].message.content.strip()
