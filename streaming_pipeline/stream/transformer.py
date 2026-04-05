from datetime import datetime
import pandas as pd
from typing import Dict, Any, List

class Transformer:
    """Transforms clickstream events to match the ML pipeline schema."""
    
    def __init__(self, course_start_date: str = "2023-09-01"):
        self.course_start_date = datetime.fromisoformat(course_start_date)
    
    def timestamp_to_date(self, timestamp_str: str) -> int:
        """Convert ISO-8601 timestamp to integer days since course start."""
        try:
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            date_diff = timestamp - self.course_start_date
            return max(0, date_diff.days)
        except Exception:
            return 0
    
    def transform_batch(self, events: List[Dict[str, Any]]) -> pd.DataFrame:
        """Transform a batch of events to DataFrame with ML schema."""
        transformed = []
        for ev in events:
            transformed.append({
                "id_student": ev.get("id_student"),
                "date": self.timestamp_to_date(ev.get("timestamp", "")),
                "id_site": ev.get("id_site"),
                "sum_click": ev.get("click_count", 0)
            })
        
        df = pd.DataFrame(transformed)
        return df[df['sum_click'] > 0].astype({
            'id_student': 'int32',
            'date': 'int32', 
            'id_site': 'int32',
            'sum_click': 'int32'
        })
