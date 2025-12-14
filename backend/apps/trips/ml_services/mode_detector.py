import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import numpy as np


class ModeDetector:
    """
    Mock AI service for transport mode detection
    In production, this would integrate with real ML models
    """
    
    def __init__(self):
        self.mode_probabilities = {
            'walk': {'min_speed': 0, 'max_speed': 8, 'base_prob': 0.3},
            'cycle': {'min_speed': 5, 'max_speed': 25, 'base_prob': 0.2},
            'bike': {'min_speed': 15, 'max_speed': 60, 'base_prob': 0.1},
            'car': {'min_speed': 10, 'max_speed': 120, 'base_prob': 0.25},
            'bus': {'min_speed': 5, 'max_speed': 50, 'base_prob': 0.1},
            'metro': {'min_speed': 20, 'max_speed': 80, 'base_prob': 0.05},
        }
    
    def predict_mode(self, trip_data: Dict) -> Tuple[str, float]:
        """
        Predict transport mode based on trip characteristics
        
        Args:
            trip_data: Dictionary containing:
                - distance_km: Trip distance in kilometers
                - duration_minutes: Trip duration in minutes
                - time_of_day: Hour of the day (0-23)
                - waypoints: List of GPS waypoints (optional)
                - weather: Weather conditions (optional)
        
        Returns:
            Tuple of (predicted_mode, confidence_score)
        """
        
        distance_km = trip_data.get('distance_km', 0)
        duration_minutes = trip_data.get('duration_minutes', 1)
        time_of_day = trip_data.get('time_of_day', 12)
        waypoints = trip_data.get('waypoints', [])
        
        # Calculate average speed
        avg_speed_kmh = (distance_km / duration_minutes) * 60 if duration_minutes > 0 else 0
        
        # Calculate probabilities for each mode
        mode_scores = {}
        
        for mode, config in self.mode_probabilities.items():
            # Base probability
            score = config['base_prob']
            
            # Speed-based scoring
            if config['min_speed'] <= avg_speed_kmh <= config['max_speed']:
                speed_score = 1.0
            else:
                # Penalty for being outside speed range
                if avg_speed_kmh < config['min_speed']:
                    speed_score = max(0, 1 - (config['min_speed'] - avg_speed_kmh) / config['min_speed'])
                else:
                    speed_score = max(0, 1 - (avg_speed_kmh - config['max_speed']) / config['max_speed'])
            
            score *= speed_score
            
            # Distance-based adjustments
            if mode == 'walk' and distance_km > 5:
                score *= 0.1  # Unlikely to walk very far
            elif mode == 'cycle' and distance_km > 20:
                score *= 0.3  # Less likely to cycle very far
            elif mode in ['bus', 'metro'] and distance_km < 1:
                score *= 0.2  # Less likely to use public transport for short trips
            
            # Time-based adjustments
            if mode in ['bus', 'metro']:
                # Higher probability during rush hours
                if 7 <= time_of_day <= 9 or 17 <= time_of_day <= 19:
                    score *= 1.5
                elif 22 <= time_of_day or time_of_day <= 5:
                    score *= 0.3  # Less public transport at night
            
            mode_scores[mode] = score
        
        # Add some randomness to simulate real-world uncertainty
        for mode in mode_scores:
            mode_scores[mode] *= random.uniform(0.8, 1.2)
        
        # Find the mode with highest score
        predicted_mode = max(mode_scores, key=mode_scores.get)
        
        # Calculate confidence (normalize scores)
        total_score = sum(mode_scores.values())
        confidence = mode_scores[predicted_mode] / total_score if total_score > 0 else 0.5
        
        # Cap confidence at reasonable levels
        confidence = min(confidence, 0.95)
        confidence = max(confidence, 0.1)
        
        return predicted_mode, confidence
    
    def analyze_waypoints(self, waypoints: List[Dict]) -> Dict:
        """
        Analyze GPS waypoints to extract movement patterns
        
        Args:
            waypoints: List of waypoint dictionaries with lat, lng, timestamp
        
        Returns:
            Dictionary with movement analysis
        """
        if len(waypoints) < 2:
            return {
                'avg_speed': 0,
                'max_speed': 0,
                'stops_count': 0,
                'direction_changes': 0,
                'smoothness_score': 0.5
            }
        
        speeds = []
        direction_changes = 0
        stops_count = 0
        
        for i in range(1, len(waypoints)):
            prev_point = waypoints[i-1]
            curr_point = waypoints[i]
            
            # Calculate distance and time
            distance = self._haversine_distance(
                prev_point['lat'], prev_point['lng'],
                curr_point['lat'], curr_point['lng']
            )
            
            time_diff = (curr_point['timestamp'] - prev_point['timestamp']).total_seconds() / 3600
            
            if time_diff > 0:
                speed = distance / time_diff
                speeds.append(speed)
                
                # Detect stops (very low speed)
                if speed < 1:
                    stops_count += 1
        
        # Calculate direction changes
        if len(waypoints) >= 3:
            for i in range(2, len(waypoints)):
                bearing1 = self._calculate_bearing(waypoints[i-2], waypoints[i-1])
                bearing2 = self._calculate_bearing(waypoints[i-1], waypoints[i])
                
                angle_diff = abs(bearing2 - bearing1)
                if angle_diff > 180:
                    angle_diff = 360 - angle_diff
                
                if angle_diff > 45:  # Significant direction change
                    direction_changes += 1
        
        return {
            'avg_speed': np.mean(speeds) if speeds else 0,
            'max_speed': max(speeds) if speeds else 0,
            'stops_count': stops_count,
            'direction_changes': direction_changes,
            'smoothness_score': 1 / (1 + direction_changes * 0.1)  # Higher = smoother
        }
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS points in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon/2) * math.sin(dlon/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    def _calculate_bearing(self, point1: Dict, point2: Dict) -> float:
        """Calculate bearing between two points"""
        lat1, lon1 = math.radians(point1['lat']), math.radians(point1['lng'])
        lat2, lon2 = math.radians(point2['lat']), math.radians(point2['lng'])
        
        dlon = lon2 - lon1
        
        y = math.sin(dlon) * math.cos(lat2)
        x = (math.cos(lat1) * math.sin(lat2) - 
             math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
        
        bearing = math.atan2(y, x)
        return math.degrees(bearing)
    
    def detect_trip_segments(self, waypoints: List[Dict], min_stop_duration: int = 300) -> List[Dict]:
        """
        Detect trip segments by identifying stops
        
        Args:
            waypoints: List of GPS waypoints
            min_stop_duration: Minimum stop duration in seconds
        
        Returns:
            List of trip segments with start/end points
        """
        if len(waypoints) < 2:
            return []
        
        segments = []
        current_segment_start = 0
        in_stop = False
        stop_start_time = None
        
        for i in range(1, len(waypoints)):
            prev_point = waypoints[i-1]
            curr_point = waypoints[i]
            
            # Calculate speed
            distance = self._haversine_distance(
                prev_point['lat'], prev_point['lng'],
                curr_point['lat'], curr_point['lng']
            )
            
            time_diff = (curr_point['timestamp'] - prev_point['timestamp']).total_seconds()
            speed = (distance / time_diff) * 3600 if time_diff > 0 else 0  # km/h
            
            # Detect stop
            if speed < 1:  # Very low speed indicates stop
                if not in_stop:
                    in_stop = True
                    stop_start_time = prev_point['timestamp']
            else:
                if in_stop:
                    # End of stop
                    stop_duration = (prev_point['timestamp'] - stop_start_time).total_seconds()
                    
                    if stop_duration >= min_stop_duration:
                        # This was a significant stop, create segment
                        if current_segment_start < i - 1:
                            segments.append({
                                'start_idx': current_segment_start,
                                'end_idx': i - 1,
                                'waypoints': waypoints[current_segment_start:i]
                            })
                        
                        current_segment_start = i
                    
                    in_stop = False
                    stop_start_time = None
        
        # Add final segment
        if current_segment_start < len(waypoints) - 1:
            segments.append({
                'start_idx': current_segment_start,
                'end_idx': len(waypoints) - 1,
                'waypoints': waypoints[current_segment_start:]
            })
        
        return segments