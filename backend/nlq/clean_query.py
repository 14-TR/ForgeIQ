#step2_CleanQuery.py


def clean_query(query):

    try:

        # print(f"raw query: {query}")
        
        if "```sql" in query:

            # Extract everything between the ```sql and ``` markers
            cleaned_query = query.split("```sql")[1].split("```")[0].strip()

        elif "EXPLAIN ANALYZE" in query:

            # Extract everything after the EXPLAIN ANALYZE marker
            cleaned_query = query.split("EXPLAIN ANALYZE")[1].strip()
        
        else:

            # If no ```sql markers, assume the entire response is SQL
            cleaned_query = query.strip()
        

        # Debugging: Log the cleaned query
        # print("Cleaned Query:")

        # print(cleaned_query)


        return cleaned_query


    except Exception as e:

        raise ValueError(f"Error cleaning query: {e}")

