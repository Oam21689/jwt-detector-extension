# JWT Detector

JWT Detector is a browser extension designed for ethical hackers, penetration testers, and developers to analyze JSON Web Tokens (JWTs) used in web applications. The extension identifies JWTs in HTTP Authorization headers and displays them directly in the popup interface. It also parses the token to extract its algorithm, payload, and signature for further analysis.

## Features

- JWT Detection: Automatically identifies JSON Web Tokens (JWTs) in the HTTP Authorization headers.
- Algorithm Detection: Parses and displays the signing algorithm used (e.g., HS256, RS256).
- Payload Extraction: Decodes and displays the payload of the token for easy analysis.
- Copy to Clipboard: Easily copy the detected JWT to your clipboard for further testing.
- Toggle Activation: Enable or disable the extension with a single switch.

## How It Works

- Activate the Extension: Use the toggle switch in the popup to enable or disable the detector.
- View Detected JWTs: When active, JWT Detector monitors HTTP headers for tokens in the Authorization: Bearer format.
- Analyze JWT:
  - Displays the signing algorithm.
  - Decodes and shows the payload.
  - Highlights issues like missing or weak algorithms.
- Copy Tokens: Quickly copy the detected token for use in external tools.

## Installation

- Download or clone this repository.
- Open your browser and go to about:debugging#/runtime/this-firefox (Firefox) or chrome://extensions/ (Chrome).
- Enable Developer Mode.
- Click on Load Temporary Add-on (Firefox) or Load unpacked (Chrome).
- Select the directory containing the JWT Detector files.
