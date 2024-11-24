import os
import requests
from google.oauth2 import service_account
from google.cloud import vision

# pip install google-cloud-vision google-auth google-auth-oauthlib google-auth-httplib2 requests

# Configuration
# google_credentials_json = "/path/to/google-credentials.json"

# Initialize the evaluator
# evaluator = GeminiImageEvaluator(google_credentials_json)


class GeminiImageEvaluator:
    def __init__(self, google_credentials_json):
        # Authenticate with Google Cloud Vision API (Gemini AI endpoint as substitute)
        self.credentials = service_account.Credentials.from_service_account_file(
            google_credentials_json
        )
        self.client = vision.ImageAnnotatorClient(credentials=self.credentials)

    def evaluate_image(self, image_path):
        """Uploads an image to Google Vision API (Gemini) for evaluation."""
        with open(image_path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = self.client.label_detection(image=image)

        if response.error.message:
            raise Exception(f"API Error: {response.error.message}")

        # Extract labels and confidence scores
        labels = {
            label.description: label.score for label in response.label_annotations
        }
        print("Detected Labels:", labels)
        return labels
