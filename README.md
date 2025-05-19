# Financial Planner

This project contains a simple Streamlit web application for tracking personal finances.  
It lets you manage accounts and transactions, upload PDF statements and view a summary dashboard.
The app stores data in **Supabase** and uses **Microsoft OAuth** for authentication.  
PDF extraction is powered by Google's Generative AI model.

## Installation

Install the dependencies listed in `requirements.txt`:

```bash
pip install -r requirements.txt
```

Create a `.env` file and set the required environment variables:

- `CLIENT_ID`, `TENANT_ID`, `CLIENT_SECRET` – Azure AD credentials
- `SUPABASE_URL`, `SUPABASE_KEY` – Supabase connection info
- `GOOGLE_API_KEY`, `GOOGLE_PROJECT_ID`, `GEMINI_MODEL` – configuration for the PDF extractor

## Running

Launch the development server with Streamlit:

```bash
streamlit run app.py
```

A `Dockerfile` is included for containerized execution.

## Directory structure

```
.
├── app.py               # Main Streamlit entry point
├── auth.py              # Microsoft OAuth helpers
├── database.py          # Supabase CRUD operations
├── dashboard.py         # Dashboard UI helpers
├── extractor.py         # PDF parsing and AI logic
├── utils.py             # Misc utilities
├── components/          # Reusable Streamlit widgets
│   ├── auth_widgets.py
│   ├── charts.py
│   └── sidebar.py
├── pages/               # Streamlit page modules
│   ├── 1_accounts.py
│   ├── 2_transactions.py
│   ├── 3_statements.py
│   └── 4_dashboard.py
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container setup
└── test.py              # Basic test harness
```

## Testing

Run the simple tests with:

```bash
python test.py
```
