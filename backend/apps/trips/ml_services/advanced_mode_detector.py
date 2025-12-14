"""
Advanced Travel Mode Detector - Using RandomForest and XGBoost models
Enhanced to provide high-accuracy predictions and explanations
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime, timedelta
import joblib
from django.conf import settings

# Import ML libraries
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

# Import base mode detector for compatibility
from .mode_detector import ModeDetector

logger = logging.getLogger('apps.ml')

class AdvancedModeDetector:
    """
    Enhanced transport mode detection using ensemble of Random Forest and XGBoost
    """
    
    def __init__(self):
        self.random_forest = None
        self.xgboost = None
        self.scaler = StandardScaler()
        self.base_detector = ModeDetector()  # Fallback for compatibility
        self.models_loaded = False
        self.model_path = settings.ML_CONFIG['MODEL_PATH']
        self.rf_config = settings.ML_CONFIG['RANDOM_FOREST']
        self.xgb_config = settings.ML_CONFIG['XGBOOST']
        self.feature_columns = settings.ML_CONFIG['FEATURE_COLUMNS']
        self.target_column = settings.ML_CONFIG['TARGET_COLUMN']
        self.transport_modes = settings.ML_CONFIG['TRANSPORT_MODES']
        self.load_models()
    
    def load_models(self) -> bool:
        """
        Load trained ML models if they exist, otherwise create new ones
        """
        try:
            # Check if model directory exists
            os.makedirs(self.model_path, exist_ok=True)
            
            # Paths to model files
            rf_path = os.path.join(self.model_path, 'random_forest_model.joblib')
            xgb_path = os.path.join(self.model_path, 'xgboost_model.joblib')
            scaler_path = os.path.join(self.model_path, 'scaler.joblib')
            
            # Load models if they exist
            if os.path.exists(rf_path) and os.path.exists(xgb_path) and os.path.exists(scaler_path):
                self.random_forest = joblib.load(rf_path)
                self.xgboost = joblib.load(xgb_path)
                self.scaler = joblib.load(scaler_path)
                self.models_loaded = True
                logger.info("Successfully loaded ML models")
                return True
            else:
                # Initialize new models
                self.random_forest = RandomForestClassifier(
                    n_estimators=self.rf_config['N_ESTIMATORS'],
                    max_depth=self.rf_config['MAX_DEPTH'],
                    min_samples_split=self.rf_config['MIN_SAMPLES_SPLIT'],
                    min_samples_leaf=self.rf_config['MIN_SAMPLES_LEAF'],
                    random_state=self.rf_config['RANDOM_STATE'],
                    n_jobs=-1,
                    verbose=0
                )
                
                self.xgboost = xgb.XGBClassifier(
                    n_estimators=self.xgb_config['N_ESTIMATORS'],
                    max_depth=self.xgb_config['MAX_DEPTH'],
                    learning_rate=self.xgb_config['LEARNING_RATE'],
                    subsample=self.xgb_config['SUBSAMPLE'],
                    colsample_bytree=self.xgb_config['COLSAMPLE_BYTREE'],
                    random_state=self.xgb_config['RANDOM_STATE'],
                    n_jobs=-1,
                    verbosity=0
                )
                
                logger.info("Initialized new ML models")
                return False
        except Exception as e:
            logger.error(f"Error loading ML models: {str(e)}")
            return False
    
    def save_models(self) -> bool:
        """
        Save trained ML models
        """
        try:
            # Check if models are trained
            if not hasattr(self.random_forest, 'classes_') or not hasattr(self.xgboost, 'classes_'):
                logger.warning("Cannot save models - models not trained yet")
                return False
                
            # Save models
            rf_path = os.path.join(self.model_path, 'random_forest_model.joblib')
            xgb_path = os.path.join(self.model_path, 'xgboost_model.joblib')
            scaler_path = os.path.join(self.model_path, 'scaler.joblib')
            
            joblib.dump(self.random_forest, rf_path)
            joblib.dump(self.xgboost, xgb_path)
            joblib.dump(self.scaler, scaler_path)
            
            logger.info("Successfully saved ML models")
            return True
        except Exception as e:
            logger.error(f"Error saving ML models: {str(e)}")
            return False
    
    def preprocess_data(self, trip_data: Dict) -> np.ndarray:
        """
        Preprocess trip data for model input
        
        Args:
            trip_data: Dictionary containing trip features
            
        Returns:
            Numpy array of preprocessed features
        """
        try:
            # Extract features
            features = {}
            
            # Core features
            features['distance_km'] = trip_data.get('distance_km', 0)
            features['duration_minutes'] = trip_data.get('duration_minutes', 0)
            
            # Calculate average speed
            avg_speed = 0
            if features['duration_minutes'] > 0:
                avg_speed = (features['distance_km'] / features['duration_minutes']) * 60
            features['avg_speed'] = avg_speed
            
            # Time-related features
            start_time = trip_data.get('start_time')
            if start_time:
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                
                features['time_of_day'] = start_time.hour
                features['day_of_week'] = start_time.weekday()
                features['is_weekend'] = 1 if start_time.weekday() >= 5 else 0
                features['is_rush_hour'] = 1 if (7 <= start_time.hour <= 10 or 16 <= start_time.hour <= 19) else 0
            else:
                features['time_of_day'] = trip_data.get('time_of_day', 12)
                features['day_of_week'] = 0
                features['is_weekend'] = 0
                features['is_rush_hour'] = 0
            
            # Movement pattern features from waypoints analysis
            waypoints = trip_data.get('waypoints', [])
            if waypoints:
                waypoint_analysis = self.analyze_waypoints(waypoints)
                features['max_speed'] = waypoint_analysis['max_speed']
                features['stops_count'] = waypoint_analysis['stops_count']
                features['direction_changes'] = waypoint_analysis['direction_changes']
                features['avg_acceleration'] = waypoint_analysis.get('avg_acceleration', 0)
                features['max_acceleration'] = waypoint_analysis.get('max_acceleration', 0)
            else:
                # Default values if no waypoints
                features['max_speed'] = avg_speed * 1.5
                features['stops_count'] = 0
                features['direction_changes'] = 0
                features['avg_acceleration'] = 0
                features['max_acceleration'] = 0
            
            # Weather features
            weather = trip_data.get('weather', {})
            if weather:
                features['weather_temp'] = weather.get('temperature', 20)
                features['weather_condition'] = self._encode_weather_condition(weather.get('condition', 'clear'))
                features['is_precipitation'] = 1 if weather.get('precipitation', 0) > 0 else 0
            else:
                features['weather_temp'] = 20
                features['weather_condition'] = 0
                features['is_precipitation'] = 0
            
            # Route type
            features['route_type'] = trip_data.get('route_type', 0)
            
            # Create feature vector
            feature_vector = []
            for feature in self.feature_columns:
                feature_vector.append(features.get(feature, 0))
            
            feature_array = np.array(feature_vector).reshape(1, -1)
            
            # Scale features if model is loaded
            if self.models_loaded:
                try:
                    feature_array = self.scaler.transform(feature_array)
                except:
                    logger.warning("Error scaling features, using unscaled features")
            
            return feature_array
        except Exception as e:
            logger.error(f"Error preprocessing data: {str(e)}")
            return np.zeros((1, len(self.feature_columns)))
    
    def predict_mode(self, trip_data: Dict) -> Tuple[str, float, Dict]:
        """
        Predict transport mode with ensemble of Random Forest and XGBoost
        
        Args:
            trip_data: Dictionary containing trip features
            
        Returns:
            Tuple of (predicted_mode, confidence_score, detailed_results)
        """
        try:
            # Check if models are loaded
            if not self.models_loaded:
                # Fall back to base detector
                mode, confidence = self.base_detector.predict_mode(trip_data)
                return mode, confidence, {"detail": "Using fallback model", "mode_probabilities": {mode: confidence}}
            
            # Preprocess data
            features = self.preprocess_data(trip_data)
            
            # Get predictions from both models
            rf_proba = self.random_forest.predict_proba(features)[0]
            xgb_proba = self.xgboost.predict_proba(features)[0]
            
            # Ensemble predictions (weighted average)
            ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
            predicted_idx = np.argmax(ensemble_proba)
            predicted_mode = self.transport_modes[predicted_idx]
            confidence = ensemble_proba[predicted_idx]
            
            # Feature importance (from Random Forest)
            importances = self.random_forest.feature_importances_
            feature_importance = dict(zip(self.feature_columns, importances))
            
            # Prepare detailed results
            mode_probabilities = {}
            for idx, mode in enumerate(self.transport_modes):
                mode_probabilities[mode] = float(ensemble_proba[idx])
            
            detailed_results = {
                "predicted_mode": predicted_mode,
                "confidence": float(confidence),
                "mode_probabilities": mode_probabilities,
                "feature_importance": feature_importance,
                "model_type": "ensemble_rf_xgb"
            }
            
            logger.debug(f"Predicted {predicted_mode} with {confidence:.2f} confidence")
            
            return predicted_mode, float(confidence), detailed_results
        
        except Exception as e:
            logger.error(f"Error in mode prediction: {str(e)}")
            # Fall back to base detector
            mode, confidence = self.base_detector.predict_mode(trip_data)
            return mode, confidence, {"detail": f"Error: {str(e)}", "mode_probabilities": {mode: confidence}}
    
    def analyze_waypoints(self, waypoints: List[Dict]) -> Dict:
        """
        Analyze GPS waypoints to extract movement patterns
        Enhanced version with more detailed metrics
        
        Args:
            waypoints: List of waypoint dictionaries with lat, lng, timestamp
            
        Returns:
            Dictionary with detailed movement analysis
        """
        if len(waypoints) < 2:
            return {
                'avg_speed': 0,
                'max_speed': 0,
                'stops_count': 0,
                'direction_changes': 0,
                'smoothness_score': 0.5,
                'avg_acceleration': 0,
                'max_acceleration': 0
            }
        
        speeds = []
        accelerations = []
        direction_changes = 0
        stops_count = 0
        stop_durations = []
        
        for i in range(1, len(waypoints)):
            prev_point = waypoints[i-1]
            curr_point = waypoints[i]
            
            # Calculate distance
            distance = self._haversine_distance(
                prev_point['lat'], prev_point['lng'],
                curr_point['lat'], curr_point['lng']
            )
            
            # Process timestamp
            prev_time = self._parse_timestamp(prev_point['timestamp'])
            curr_time = self._parse_timestamp(curr_point['timestamp'])
            
            time_diff_seconds = (curr_time - prev_time).total_seconds()
            time_diff_hours = time_diff_seconds / 3600
            
            if time_diff_seconds > 0:
                # Calculate speed (km/h)
                speed = distance / time_diff_hours
                speeds.append(speed)
                
                # Detect stops (very low speed)
                if speed < 1:
                    stops_count += 1
                    
                    # Calculate stop duration if possible
                    if i+1 < len(waypoints):
                        next_point = waypoints[i+1]
                        next_time = self._parse_timestamp(next_point['timestamp'])
                        stop_duration = (next_time - curr_time).total_seconds()
                        if stop_duration > 30:  # Only count stops longer than 30 seconds
                            stop_durations.append(stop_duration)
                
                # Calculate acceleration if we have at least 2 speeds
                if len(speeds) >= 2:
                    prev_speed = speeds[-2]
                    curr_speed = speeds[-1]
                    acceleration = (curr_speed - prev_speed) / time_diff_seconds
                    accelerations.append(acceleration)
        
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
        
        # Calculate advanced metrics
        avg_speed = np.mean(speeds) if speeds else 0
        max_speed = max(speeds) if speeds else 0
        avg_acceleration = np.mean(np.abs(accelerations)) if accelerations else 0
        max_acceleration = max(np.abs(accelerations)) if accelerations else 0
        avg_stop_duration = np.mean(stop_durations) if stop_durations else 0
        
        # Calculate smoothness score (higher = smoother trip)
        smoothness_score = 1.0 / (1.0 + 0.1 * direction_changes + 0.05 * stops_count)
        smoothness_score = min(1.0, max(0.1, smoothness_score))
        
        return {
            'avg_speed': float(avg_speed),
            'max_speed': float(max_speed),
            'stops_count': stops_count,
            'direction_changes': direction_changes,
            'smoothness_score': float(smoothness_score),
            'avg_acceleration': float(avg_acceleration),
            'max_acceleration': float(max_acceleration),
            'avg_stop_duration': float(avg_stop_duration),
            'stop_count': len(stop_durations)
        }
    
    def train_models(self, training_data: List[Dict]) -> Dict:
        """
        Train ML models with trip data
        
        Args:
            training_data: List of trip dictionaries with features and transport_mode
            
        Returns:
            Dictionary with training results
        """
        try:
            if not settings.FEATURE_FLAGS['ENABLE_ML_TRAINING']:
                logger.info("ML training disabled in settings")
                return {"status": "skipped", "message": "ML training disabled in settings"}
                
            if not training_data or len(training_data) < 50:
                logger.warning(f"Not enough training data: {len(training_data) if training_data else 0} samples")
                return {"status": "error", "message": "Not enough training data (min 50 samples required)"}
            
            # Prepare training data
            X = []
            y = []
            
            for trip in training_data:
                # Skip trips without transport mode
                if 'transport_mode' not in trip:
                    continue
                    
                # Process features
                feature_dict = {}
                feature_dict['distance_km'] = trip.get('distance_km', 0)
                feature_dict['duration_minutes'] = trip.get('duration_minutes', 0)
                
                # Calculate derived features
                if feature_dict['duration_minutes'] > 0:
                    feature_dict['avg_speed'] = (feature_dict['distance_km'] / feature_dict['duration_minutes']) * 60
                else:
                    feature_dict['avg_speed'] = 0
                
                # Process start time
                start_time = trip.get('start_time')
                if start_time:
                    if isinstance(start_time, str):
                        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    
                    feature_dict['time_of_day'] = start_time.hour
                    feature_dict['day_of_week'] = start_time.weekday()
                else:
                    feature_dict['time_of_day'] = 12
                    feature_dict['day_of_week'] = 0
                
                # Movement pattern features
                waypoints = trip.get('waypoints', [])
                if waypoints:
                    waypoint_analysis = self.analyze_waypoints(waypoints)
                    feature_dict['max_speed'] = waypoint_analysis['max_speed']
                    feature_dict['stops_count'] = waypoint_analysis['stops_count']
                    feature_dict['direction_changes'] = waypoint_analysis['direction_changes']
                else:
                    feature_dict['max_speed'] = feature_dict['avg_speed'] * 1.5
                    feature_dict['stops_count'] = 0
                    feature_dict['direction_changes'] = 0
                
                # Weather features
                weather = trip.get('weather', {})
                if weather:
                    feature_dict['weather_temp'] = weather.get('temperature', 20)
                    feature_dict['weather_condition'] = self._encode_weather_condition(weather.get('condition', 'clear'))
                else:
                    feature_dict['weather_temp'] = 20
                    feature_dict['weather_condition'] = 0
                
                # Route type
                feature_dict['route_type'] = trip.get('route_type', 0)
                
                # Extract features in correct order
                features = []
                for feature in self.feature_columns:
                    features.append(feature_dict.get(feature, 0))
                
                X.append(features)
                y.append(trip['transport_mode'])
            
            # Convert to numpy arrays
            X = np.array(X)
            y = np.array(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y if len(set(y)) > 1 else None
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train = self.scaler.fit_transform(X_train)
            X_test = self.scaler.transform(X_test)
            
            # Train Random Forest
            logger.info("Training Random Forest model...")
            self.random_forest = RandomForestClassifier(
                n_estimators=self.rf_config['N_ESTIMATORS'],
                max_depth=self.rf_config['MAX_DEPTH'],
                min_samples_split=self.rf_config['MIN_SAMPLES_SPLIT'],
                min_samples_leaf=self.rf_config['MIN_SAMPLES_LEAF'],
                random_state=self.rf_config['RANDOM_STATE'],
                n_jobs=-1
            )
            self.random_forest.fit(X_train, y_train)
            
            # Train XGBoost
            logger.info("Training XGBoost model...")
            self.xgboost = xgb.XGBClassifier(
                n_estimators=self.xgb_config['N_ESTIMATORS'],
                max_depth=self.xgb_config['MAX_DEPTH'],
                learning_rate=self.xgb_config['LEARNING_RATE'],
                subsample=self.xgb_config['SUBSAMPLE'],
                colsample_bytree=self.xgb_config['COLSAMPLE_BYTREE'],
                random_state=self.xgb_config['RANDOM_STATE'],
                n_jobs=-1
            )
            self.xgboost.fit(X_train, y_train)
            
            # Evaluate Random Forest
            rf_predictions = self.random_forest.predict(X_test)
            rf_accuracy = accuracy_score(y_test, rf_predictions)
            rf_report = classification_report(y_test, rf_predictions, output_dict=True)
            
            # Evaluate XGBoost
            xgb_predictions = self.xgboost.predict(X_test)
            xgb_accuracy = accuracy_score(y_test, xgb_predictions)
            xgb_report = classification_report(y_test, xgb_predictions, output_dict=True)
            
            # Evaluate ensemble
            rf_proba = self.random_forest.predict_proba(X_test)
            xgb_proba = self.xgboost.predict_proba(X_test)
            ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
            ensemble_predictions = np.array([self.random_forest.classes_[np.argmax(proba)] for proba in ensemble_proba])
            ensemble_accuracy = accuracy_score(y_test, ensemble_predictions)
            ensemble_report = classification_report(y_test, ensemble_predictions, output_dict=True)
            
            # Feature importance
            feature_importance = dict(zip(self.feature_columns, self.random_forest.feature_importances_))
            
            # Mark models as loaded
            self.models_loaded = True
            
            # Save models
            self.save_models()
            
            # Prepare training results
            results = {
                "status": "success",
                "samples_count": len(X),
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "random_forest": {
                    "accuracy": float(rf_accuracy),
                    "report": rf_report
                },
                "xgboost": {
                    "accuracy": float(xgb_accuracy),
                    "report": xgb_report
                },
                "ensemble": {
                    "accuracy": float(ensemble_accuracy),
                    "report": ensemble_report
                },
                "feature_importance": feature_importance,
                "models_saved": True
            }
            
            logger.info(f"Models trained successfully. Ensemble accuracy: {ensemble_accuracy:.4f}")
            
            return results
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    def detect_trip_segments(self, waypoints: List[Dict], min_stop_duration: int = 300) -> List[Dict]:
        """
        Detect trip segments by identifying stops
        
        Args:
            waypoints: List of GPS waypoints
            min_stop_duration: Minimum stop duration in seconds
            
        Returns:
            List of trip segments with start/end points and predicted modes
        """
        if len(waypoints) < 10:
            return [{
                'start_idx': 0,
                'end_idx': len(waypoints) - 1,
                'waypoints': waypoints,
                'predicted_mode': None
            }]
        
        segments = []
        current_segment_start = 0
        in_stop = False
        stop_start_time = None
        
        for i in range(1, len(waypoints)):
            prev_point = waypoints[i-1]
            curr_point = waypoints[i]
            
            # Calculate distance and speed
            distance = self._haversine_distance(
                prev_point['lat'], prev_point['lng'],
                curr_point['lat'], curr_point['lng']
            )
            
            prev_time = self._parse_timestamp(prev_point['timestamp'])
            curr_time = self._parse_timestamp(curr_point['timestamp'])
            
            time_diff_seconds = (curr_time - prev_time).total_seconds()
            
            if time_diff_seconds > 0:
                speed_kmh = (distance / time_diff_seconds) * 3600
                
                # Detect stop
                if speed_kmh < 1:  # Very low speed indicates stop
                    if not in_stop:
                        in_stop = True
                        stop_start_time = prev_time
                else:
                    if in_stop:
                        # End of stop
                        stop_duration = (prev_time - stop_start_time).total_seconds()
                        
                        if stop_duration >= min_stop_duration:
                            # This was a significant stop, create segment
                            if current_segment_start < i - 1:
                                segment_waypoints = waypoints[current_segment_start:i]
                                segment_mode = self._predict_segment_mode(segment_waypoints)
                                
                                segments.append({
                                    'start_idx': current_segment_start,
                                    'end_idx': i - 1,
                                    'waypoints': segment_waypoints,
                                    'predicted_mode': segment_mode,
                                    'start_time': self._parse_timestamp(segment_waypoints[0]['timestamp']),
                                    'end_time': self._parse_timestamp(segment_waypoints[-1]['timestamp']),
                                })
                            
                            current_segment_start = i
                        
                        in_stop = False
                        stop_start_time = None
        
        # Add final segment
        if current_segment_start < len(waypoints) - 1:
            segment_waypoints = waypoints[current_segment_start:]
            segment_mode = self._predict_segment_mode(segment_waypoints)
            
            segments.append({
                'start_idx': current_segment_start,
                'end_idx': len(waypoints) - 1,
                'waypoints': segment_waypoints,
                'predicted_mode': segment_mode,
                'start_time': self._parse_timestamp(segment_waypoints[0]['timestamp']),
                'end_time': self._parse_timestamp(segment_waypoints[-1]['timestamp']),
            })
        
        return segments
    
    def _predict_segment_mode(self, waypoints: List[Dict]) -> str:
        """Predict mode for a specific segment"""
        if not waypoints:
            return None
            
        # Calculate basic trip metrics
        first_point = waypoints[0]
        last_point = waypoints[-1]
        
        first_time = self._parse_timestamp(first_point['timestamp'])
        last_time = self._parse_timestamp(last_point['timestamp'])
        
        duration_minutes = (last_time - first_time).total_seconds() / 60
        
        # Calculate distance
        distance_km = 0
        for i in range(1, len(waypoints)):
            distance_km += self._haversine_distance(
                waypoints[i-1]['lat'], waypoints[i-1]['lng'],
                waypoints[i]['lat'], waypoints[i]['lng']
            )
        
        # Prepare trip data
        trip_data = {
            'distance_km': distance_km,
            'duration_minutes': duration_minutes,
            'time_of_day': first_time.hour,
            'day_of_week': first_time.weekday(),
            'waypoints': waypoints
        }
        
        # Predict mode
        mode, _, _ = self.predict_mode(trip_data)
        return mode
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS points in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        return R * c
    
    def _calculate_bearing(self, point1: Dict, point2: Dict) -> float:
        """Calculate bearing between two points in degrees"""
        lat1 = np.radians(point1['lat'])
        lon1 = np.radians(point1['lng'])
        lat2 = np.radians(point2['lat'])
        lon2 = np.radians(point2['lng'])
        
        dlon = lon2 - lon1
        
        y = np.sin(dlon) * np.cos(lat2)
        x = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
        
        bearing = np.degrees(np.arctan2(y, x))
        return (bearing + 360) % 360
    
    def _encode_weather_condition(self, condition: str) -> int:
        """Encode weather condition as numeric value"""
        conditions = {
            'clear': 0,
            'sunny': 0,
            'partly_cloudy': 1,
            'cloudy': 2,
            'overcast': 2,
            'mist': 3,
            'fog': 3,
            'drizzle': 4,
            'rain': 5,
            'heavy_rain': 6,
            'thunderstorm': 7,
            'snow': 8,
            'sleet': 9,
            'hail': 10
        }
        
        condition = condition.lower().replace(' ', '_')
        return conditions.get(condition, 0)
    
    def _parse_timestamp(self, timestamp) -> datetime:
        """Parse timestamp to datetime object"""
        if isinstance(timestamp, datetime):
            return timestamp
        if isinstance(timestamp, str):
            try:
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except:
                try:
                    return datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%S.%fZ')
                except:
                    try:
                        return datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                    except:
                        pass
        
        # Fallback
        return datetime.now()