import datetime
import os

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


class OasiraBackup:
    def __init__(self, backup_folder, google_credentials_json, retention_days=30):
        self.backup_folder = backup_folder
        self.retention_days = retention_days
        self.service = self._authenticate_google_drive(google_credentials_json)

    def _authenticate_google_drive(self, google_credentials_json):
        """Authenticate with Google Drive using a service account JSON file."""
        credentials = service_account.Credentials.from_service_account_file(
            google_credentials_json, scopes=["https://www.googleapis.com/auth/drive"]
        )

        # api key
        # AIzaSyD4AyVlNISF_fr_ylHZpRKYpZFeixFuCYk

        return build("drive", "v3", credentials=credentials)

    def upload_backup(self, backup_file):
        """Uploads a specified backup file to Google Drive."""
        if not os.path.exists(backup_file):
            raise FileNotFoundError(f"{backup_file} does not exist.")

        file_metadata = {
            "name": os.path.basename(backup_file),
            "parents": ["1YIZm2ewH01Cuxy_B0EQpzUyEW1t3rF9c"],
        }
        media = MediaFileUpload(backup_file, mimetype="application/gzip")
        file = (
            self.service.files()
            .create(body=file_metadata, media_body=media, fields="id")
            .execute()
        )
        print(f"Uploaded {backup_file} with file ID: {file.get('id')}")

    def delete_old_backups(self):
        """Deletes backups from Google Drive older than the retention period."""
        expiration_date = datetime.datetime.now() - datetime.timedelta(
            days=self.retention_days
        )
        results = (
            self.service.files()
            .list(
                q=f"createdTime < '{expiration_date.isoformat()}' and parents in '1YIZm2ewH01Cuxy_B0EQpzUyEW1t3rF9c'",
                fields="files(id, name, createdTime)",
            )
            .execute()
        )
        old_files = results.get("files", [])

        for file in old_files:
            self.service.files().delete(fileId=file["id"]).execute()
            print(f"Deleted {file['name']} (ID: {file['id']})")

    def backup_and_cleanup(self):
        """Uploads all .tar files from the backup folder and deletes old backups."""
        for filename in os.listdir(self.backup_folder):
            if filename.endswith(".tar"):
                full_path = os.path.join(self.backup_folder, filename)
                self.upload_backup(full_path)

        self.delete_old_backups()
