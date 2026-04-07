import random
import csv
import os
import time
from datetime import datetime, timedelta
from typing import List, Dict

class ClickstreamSimulator:
    """Simulates realistic clickstream data for multiple students."""
    
    def __init__(self, course_start_date: str = "2023-09-01"):
        self.course_start_date = datetime.fromisoformat(course_start_date)
        self.students = self._generate_student_profiles()
        self.sites = list(range(1, 51))
        
    def _generate_student_profiles(self) -> List[Dict]:
        profiles = []
        for i in range(20): # Low
            profiles.append({'id_student': 1000 + i, 'daily_clicks_range': (1, 5), 'active_probability': 0.3})
        for i in range(20, 80): # Medium
            profiles.append({'id_student': 1000 + i, 'daily_clicks_range': (5, 20), 'active_probability': 0.7})
        for i in range(80, 100): # High
            profiles.append({'id_student': 1000 + i, 'daily_clicks_range': (20, 50), 'active_probability': 0.9})
        return profiles
    
    def generate_events(self, output_path: str, days: int = 7):
        """Generate historical events and save to output path."""
        events = []
        for day_offset in range(days):
            target_date = self.course_start_date + timedelta(days=day_offset)
            for student in self.students:
                if random.random() < student['active_probability']:
                    for _ in range(random.randint(1, 3)):
                        hour = random.randint(8, 22)
                        event_time = target_date.replace(hour=hour, minute=random.randint(0, 59))
                        events.append({
                            "id_student": student['id_student'],
                            "timestamp": event_time.isoformat(),
                            "id_site": random.choice(self.sites),
                            "action": "click",
                            "click_count": random.randint(*student['daily_clicks_range'])
                        })
        
        events.sort(key=lambda x: x['timestamp'])
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=["id_student", "timestamp", "id_site", "action", "click_count"])
            writer.writeheader()
            writer.writerows(events)
        return output_path
