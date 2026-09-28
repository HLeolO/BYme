{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/search",
        "function": {
          "functionId": "search",
          "region": "europe-west1"
        }
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}