import random
from datetime import datetime, time
from typing import Dict, List, Tuple
from geopy.distance import geodesic


class PurposePredictor:
    """
    Mock AI service for trip purpose prediction
    In production, this would use real ML models with location context
    """
    
    def __init__(self):
        # Time-based purpose probabilities
        self.time_patterns = {
            'work': {
                'peak_hours': [(7, 9), (17, 19)],
                'low_hours': [(22, 6)],
                'weekday_boost': 1.5,
                'weekend_penalty': 0.3
            },
            'school': {
                'peak_hours': [(7, 9), (15, 17)],
                'low_hours': [(19, 7)],
                'weekday_boost': 2.0,
                'weekend_penalty': 0.1
            },
            'shopping': {
                'peak_hours': [(10, 12), (14, 18)],
                'low_hours': [(0, 7)],
                'weekday_boost': 1.0,
                'weekend_boost': 1.3
            },
            'leisure': {
                'peak_hours': [(10, 22)],
                'low_hours': [(0, 8)],
                'weekday_boost': 0.8,
                'weekend_boost': 1.5
            },
            'social': {
                'peak_hours': [(18, 23)],
                'low_hours': [(5, 10)],
                'weekday_boost': 1.0,
                'weekend_boost': 1.4
            }
        }
        
        # Location-based keywords for purpose detection
        self.location_keywords = {
            'work': ['office', 'business', 'corporate', 'company', 'headquarters', 'building'],
            'school': ['school', 'university', 'college', 'campus', 'education', 'library'],
            'shopping': ['mall', 'store', 'shop', 'market', 'grocery', 'supermarket', 'retail'],
            'leisure': ['park', 'cinema', 'theater', 'museum', 'beach', 'restaurant', 'cafe'],
            'social': ['friend', 'family', 'home', 'residence', 'house', 'apartment'],
            'medical': ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'health']
        }
    
    def predict_purpose(self, trip_data: Dict, user_history: List[Dict] = None) -> Tuple[str, float]:
        """
        Predict trip purpose based on trip characteristics and user history
        
        Args:
            trip_data: Dictionary containing:
                - start_time: Trip start datetime
                - end_time: Trip end datetime
                - origin_lat, origin_lng: Origin coordinates
                - dest_lat, dest_lng: Destination coordinates
                - origin_address: Origin address (optional)
                - dest_address: Destination address (optional)
                - transport_mode: Transport mode used
                - weekday: Day of week (0=Monday, 6=Sunday)
            user_history: List of previous trips for pattern learning
        
        Returns:
            Tuple of (predicted_purpose, confidence_score)
        """
        
        start_time = trip_data.get('start_time')
        weekday = trip_data.get('weekday', start_time.weekday() if start_time else 0)
        dest_address = trip_data.get('dest_address', '').lower()
        origin_address = trip_data.get('origin_address', '').lower()
        transport_mode = trip_data.get('transport_mode', 'walk')
        
        # Calculate purpose scores
        purpose_scores = {}
        
        for purpose in self.time_patterns.keys():
            score = self._calculate_time_score(purpose, start_time, weekday)
            score *= self._calculate_location_score(purpose, dest_address, origin_address)
            score *= self._calculate_mode_score(purpose, transport_mode)
            
            if user_history:
                score *= self._calculate_history_score(purpose, trip_data, user_history)
            
            purpose_scores[purpose] = score
        
        # Add other purposes with base scores
        other_purposes = ['medical', 'business', 'exercise', 'other']
        for purpose in other_purposes:
            if purpose not in purpose_scores:
                purpose_scores[purpose] = 0.1  # Low base score
        
        # Add randomness for realistic uncertainty
        for purpose in purpose_scores:
            purpose_scores[purpose] *= random.uniform(0.7, 1.3)
        
        # Find highest scoring purpose
        predicted_purpose = max(purpose_scores, key=purpose_scores.get)
        
        # Calculate confidence
        total_score = sum(purpose_scores.values())
        confidence = purpose_scores[predicted_purpose] / total_score if total_score > 0 else 0.3
        
        # Normalize confidence
        confidence = min(confidence, 0.9)
        confidence = max(confidence, 0.2)
        
        return predicted_purpose, confidence
    
    def _calculate_time_score(self, purpose: str, start_time: datetime, weekday: int) -> float:
        """Calculate score based on time patterns"""
        if not start_time or purpose not in self.time_patterns:
            return 0.5
        
        pattern = self.time_patterns[purpose]
        hour = start_time.hour
        score = 0.3  # Base score
        
        # Check peak hours
        for start_hour, end_hour in pattern.get('peak_hours', []):
            if start_hour <= hour <= end_hour:
                score = 1.0
                break
        
        # Check low activity hours
        for start_hour, end_hour in pattern.get('low_hours', []):
            if start_hour > end_hour:  # Overnight period
                if hour >= start_hour or hour <= end_hour:
                    score *= 0.3
            else:
                if start_hour <= hour <= end_hour:
                    score *= 0.3
        
        # Weekend/weekday adjustments
        is_weekend = weekday >= 5
        if is_weekend:
            if 'weekend_boost' in pattern:
                score *= pattern['weekend_boost']
            elif 'weekend_penalty' in pattern:
                score *= pattern['weekend_penalty']
        else:
            if 'weekday_boost' in pattern:
                score *= pattern['weekday_boost']
        
        return score
    
    def _calculate_location_score(self, purpose: str, dest_address: str, origin_address: str) -> float:
        """Calculate score based on location context"""
        score = 1.0  # Neutral score
        
        if purpose in self.location_keywords:
            keywords = self.location_keywords[purpose]
            
            # Check destination address
            dest_matches = sum(1 for keyword in keywords if keyword in dest_address)
            if dest_matches > 0:
                score *= (1 + dest_matches * 0.5)
            
            # Check for contradictory keywords in other purposes
            for other_purpose, other_keywords in self.location_keywords.items():
                if other_purpose != purpose:
                    conflicts = sum(1 for keyword in other_keywords if keyword in dest_address)
                    if conflicts > 0:
                        score *= (1 - conflicts * 0.2)
        
        return max(score, 0.1)
    
    def _calculate_mode_score(self, purpose: str, transport_mode: str) -> float:
        """Calculate score based on transport mode preferences"""
        mode_preferences = {
            'work': {
                'car': 1.2, 'bus': 1.3, 'metro': 1.3, 'cycle': 1.1,
                'walk': 0.8, 'taxi': 0.9
            },
            'school': {
                'bus': 1.4, 'metro': 1.3, 'cycle': 1.2, 'walk': 1.1,
                'car': 0.8, 'taxi': 0.7
            },
            'shopping': {
                'car': 1.3, 'bus': 1.1, 'walk': 1.2, 'taxi': 1.1,
                'cycle': 0.8, 'metro': 0.9
            },
            'leisure': {
                'walk': 1.2, 'cycle': 1.3, 'car': 1.1, 'taxi': 1.0,
                'bus': 0.9, 'metro': 0.9
            },
            'social': {
                'car': 1.2, 'taxi': 1.3, 'walk': 1.1, 'bus': 1.0,
                'cycle': 0.9, 'metro': 1.0
            }
        }
        
        if purpose in mode_preferences and transport_mode in mode_preferences[purpose]:
            return mode_preferences[purpose][transport_mode]
        
        return 1.0  # Neutral score
    
    def _calculate_history_score(self, purpose: str, current_trip: Dict, user_history: List[Dict]) -> float:
        """Calculate score based on user's historical patterns"""
        if not user_history:
            return 1.0
        
        # Find similar trips (same time of day, similar location)
        similar_trips = []
        current_hour = current_trip.get('start_time', datetime.now()).hour
        current_dest = (current_trip.get('dest_lat', 0), current_trip.get('dest_lng', 0))
        
        for trip in user_history:
            # Check time similarity (within 2 hours)
            trip_hour = trip.get('start_time', datetime.now()).hour
            if abs(trip_hour - current_hour) <= 2:
                # Check location similarity (within 500m)
                trip_dest = (trip.get('dest_lat', 0), trip.get('dest_lng', 0))
                if current_dest[0] != 0 and trip_dest[0] != 0:
                    distance = geodesic(current_dest, trip_dest).meters
                    if distance <= 500:
                        similar_trips.append(trip)
        
        if not similar_trips:
            return 1.0
        
        # Count purposes in similar trips
        purpose_counts = {}
        for trip in similar_trips:
            trip_purpose = trip.get('purpose', 'other')
            purpose_counts[trip_purpose] = purpose_counts.get(trip_purpose, 0) + 1
        
        # Boost score if this purpose is common in similar trips
        if purpose in purpose_counts:
            frequency = purpose_counts[purpose] / len(similar_trips)
            return 1 + frequency  # Boost based on frequency
        
        return 0.8  # Slight penalty if purpose is not common
    
    def analyze_location_patterns(self, user_trips: List[Dict]) -> Dict:
        """
        Analyze user's location patterns to identify frequent destinations
        
        Args:
            user_trips: List of user's trip data
        
        Returns:
            Dictionary with location pattern analysis
        """
        location_clusters = {}
        purpose_locations = {}
        
        for trip in user_trips:
            dest_lat = trip.get('dest_lat')
            dest_lng = trip.get('dest_lng')
            purpose = trip.get('purpose', 'other')
            
            if dest_lat and dest_lng:
                dest_key = f"{dest_lat:.4f},{dest_lng:.4f}"
                
                if dest_key not in location_clusters:
                    location_clusters[dest_key] = {
                        'lat': dest_lat,
                        'lng': dest_lng,
                        'visits': 0,
                        'purposes': {}
                    }
                
                location_clusters[dest_key]['visits'] += 1
                cluster_purposes = location_clusters[dest_key]['purposes']
                cluster_purposes[purpose] = cluster_purposes.get(purpose, 0) + 1
                
                # Track purpose-location associations
                if purpose not in purpose_locations:
                    purpose_locations[purpose] = []
                purpose_locations[purpose].append((dest_lat, dest_lng))
        
        # Find most common destinations for each purpose
        common_destinations = {}
        for purpose, locations in purpose_locations.items():
            if len(locations) >= 3:  # Need at least 3 visits to consider it common
                # Find the most central location (simple centroid)
                avg_lat = sum(lat for lat, lng in locations) / len(locations)
                avg_lng = sum(lng for lat, lng in locations) / len(locations)
                common_destinations[purpose] = {
                    'lat': avg_lat,
                    'lng': avg_lng,
                    'visit_count': len(locations)
                }
        
        return {
            'location_clusters': location_clusters,
            'common_destinations': common_destinations,
            'total_destinations': len(location_clusters)
        }