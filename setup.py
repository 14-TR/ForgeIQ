from setuptools import setup, find_packages

setup(
    name='forgeiq-backend',
    version='0.1.0',
    description='Backend server and shared components for ForgeIQ',
    author='ForgeIQ Team',
    author_email='dev@example.com', # Replace with actual email if desired
    package_dir={'': 'src'}, # Tell Setuptools packages are under src
    packages=find_packages(where='src'), # Find packages under src
    install_requires=[
        # Core backend dependencies
        'fastapi>=0.115.12',
        'uvicorn[standard]>=0.34.0',
        'pydantic>=2.11.2',
        'boto3>=1.37.28',
        'psycopg2-binary>=2.9.10',
        'openai==1.61.0', # Pinned to avoid conflict
        'pandas>=2.2.3',
        'numpy>=2.2.4',
        'python-dotenv>=1.1.0',
        'PyYAML>=6.0.2',
        'typer>=0.12.3', # For CLI

        # Other dependencies (from previous requirements.txt)
        'annotated-types>=0.7.0',
        'anyio>=4.9.0',
        # botocore included via boto3
        # certifi often managed by requests/httpx/boto3
        'click>=8.1.8', # Included via typer
        'colorama>=0.4.6', # For typer/click on Windows
        'distro>=1.9.0',
        'h11>=0.14.0',
        'httpcore>=1.0.7',
        # httptools included via uvicorn[standard]
        'httpx>=0.28.1',
        'idna>=3.10',
        'jiter>=0.9.0',
        'jmespath>=1.0.1', # Included via boto3
        'python-dateutil>=2.9.0.post0',
        'pytz>=2025.2',
        # s3transfer included via boto3
        'six>=1.17.0',
        'sniffio>=1.3.1',
        'sqlparse>=0.5.3',
        'starlette>=0.46.1', # Included via fastapi
        'tqdm>=4.67.1',
        'typing-inspection>=0.4.0',
        'typing-extensions>=4.13.1',
        'tzdata>=2025.2', # Included via pytz
        'urllib3>=2.3.0',
        # watchfiles included via uvicorn[standard]
        # websockets included via uvicorn[standard]
    ],
    entry_points={
        'console_scripts': [
            # The entry point path now reflects the src layout
            'forgeiq-server=backend.cli:app',
        ],
    },
    python_requires='>=3.9',
) 