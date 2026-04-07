import psycopg2
import pandas as pd
import hashlib
from datetime import datetime
from typing import List, Dict, Optional

class DatabaseIngest:
    """Handles data extraction from the production database."""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.user_id_mapping = {}

    def get_connection(self):
        return psycopg2.connect(self.database_url)

    def map_users(self):
        """Maps string user IDs to numeric student IDs."""
        query = """
        SELECT DISTINCT u.id as user_id, 
               ROW_NUMBER() OVER (ORDER BY u.created_at) + 1000 as id_student
        FROM users u
        """
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        self.user_id_mapping = dict(zip(df['user_id'], df['id_student']))
        return self.user_id_mapping

    def fetch_events(self, start_date: str = None) -> List[Dict]:
        """Fetches ClickEvent and ClickstreamEvent data."""
        if not self.user_id_mapping:
            self.map_users()

        # Simplified extraction logic focusing on core fields
        events = []
        with self.get_connection() as conn:
            # Click Events
            query = "SELECT session_id, timestamp, page_url FROM click_events"
            if start_date: query += f" WHERE timestamp >= '{start_date}'"
            df_clicks = pd.read_sql_query(query, conn)
            
            for _, row in df_clicks.iterrows():
                user_id = self._extract_user(row['session_id'])
                if user_id in self.user_id_mapping:
                    events.append({
                        "id_student": self.user_id_mapping[user_id],
                        "timestamp": row['timestamp'].isoformat(),
                        "id_site": int(hashlib.md5(row['page_url'].encode()).hexdigest()[:8], 16) % 10000,
                        "click_count": 1
                    })
        return events

    def _extract_user(self, session_id: str) -> Optional[str]:
        for uid in self.user_id_mapping:
            if uid in session_id: return uid
        return None
