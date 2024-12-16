import os

from flask import Flask, request

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def configure_wifi():
    if request.method == "POST":
        ssid = request.form["ssid"]
        password = request.form["password"]
        os.system(f'nmcli device wifi connect "{ssid}" password "{password}"')
        return f"Connected to {ssid}"
    return """
    <form method="POST">
        SSID: <input type="text" name="ssid"><br>
        Password: <input type="password" name="password"><br>
        <input type="submit" value="Connect">
    </form>
    """


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
